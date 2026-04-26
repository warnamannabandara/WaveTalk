const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const port = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/upload', require('./routes/upload'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io – Real-time chat + meeting presence
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// Auth middleware for sockets
io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -refreshToken');
        if (!user) return next(new Error('User not found'));
        socket.user = user;
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

// Track online users: userId -> socketId
const onlineUsers = new Map();
// Track meeting rooms: meetingId -> Map<userId, {userId, userName, avatar}>
const meetingRooms = new Map();

io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    console.log(`[Socket] ${socket.user.name} connected (${socket.id})`);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // Join user's personal room
    socket.join(userId);

    // ----- CHAT -----
    socket.on('chat:send', async ({ conversationId, content, type, signLanguageData, fileUrl, fileName, fileSize, tempId }) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.map(String).includes(userId)) return;

            const message = await Message.create({
                conversation: conversationId,
                sender: userId,
                content: content || '',
                type: type || 'text',
                signLanguageData: signLanguageData || undefined,
                fileUrl: fileUrl || null,
                fileName: fileName || null,
                fileSize: fileSize || null,
                readBy: [userId]
            });
            await message.populate('sender', 'name email avatar');

            // Update conversation
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = new Date();
            conversation.participants.forEach(pid => {
                const pidStr = pid.toString();
                if (pidStr !== userId) {
                    const cur = conversation.unreadCount.get(pidStr) || 0;
                    conversation.unreadCount.set(pidStr, cur + 1);
                }
            });
            await conversation.save();

            // Ack back to sender so they can replace the optimistic temp message
            socket.emit('chat:sent', { conversationId, message, tempId });

            // Broadcast to all OTHER participants
            conversation.participants.forEach(pid => {
                const pidStr = pid.toString();
                if (pidStr !== userId) {
                    io.to(pidStr).emit('chat:message', { conversationId, message });
                }
            });
        } catch (err) {
            socket.emit('chat:error', { message: err.message, tempId });
        }
    });

    socket.on('chat:read', async ({ conversationId }) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;
            conversation.unreadCount.set(userId, 0);
            await conversation.save();
            await Message.updateMany(
                { conversation: conversationId, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            );
            socket.emit('chat:read:ack', { conversationId });
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    // ----- MEETINGS -----
    socket.on('meeting:join', ({ meetingId }) => {
        socket.join(`meeting:${meetingId}`);

        // Send list of already-present participants to the new joiner
        if (!meetingRooms.has(meetingId)) meetingRooms.set(meetingId, new Map());
        const room = meetingRooms.get(meetingId);
        const existing = Array.from(room.values());
        socket.emit('meeting:existing-participants', { participants: existing });

        // Register new joiner in the room
        room.set(userId, { userId, userName: socket.user.name, avatar: socket.user.avatar || '' });

        // Notify everyone else
        socket.to(`meeting:${meetingId}`).emit('meeting:participant:joined', {
            user: { _id: userId, name: socket.user.name, avatar: socket.user.avatar || '' }
        });
        console.log(`[Meeting] ${socket.user.name} joined room meeting:${meetingId} (${room.size} total)`);
    });

    socket.on('meeting:leave', ({ meetingId }) => {
        socket.leave(`meeting:${meetingId}`);
        const room = meetingRooms.get(meetingId);
        if (room) {
            room.delete(userId);
            if (room.size === 0) meetingRooms.delete(meetingId);
        }
        socket.to(`meeting:${meetingId}`).emit('meeting:participant:left', { userId });
    });

    // Include sender identity so the receiver can create a labelled peer connection
    socket.on('meeting:signal', ({ meetingId: _mid, to, signal }) => {
        io.to(to).emit('meeting:signal', {
            from: userId,
            fromUserName: socket.user.name,
            fromAvatar: socket.user.avatar || '',
            signal
        });
    });

    // ----- DIRECT CALLS (1-on-1 voice / video) -----
    socket.on('call:invite', ({ callId, type, toUserId }) => {
        io.to(toUserId).emit('call:invite', {
            callId,
            type,
            callerId: userId,
            callerName: socket.user.name,
            callerAvatar: socket.user.avatar || '',
            callerEmail: socket.user.email,
        });
    });

    socket.on('call:accept', ({ callId, toUserId }) => {
        io.to(toUserId).emit('call:accept', {
            callId,
            accepterId: userId,
            accepterName: socket.user.name,
            accepterAvatar: socket.user.avatar || '',
            accepterEmail: socket.user.email,
        });
    });

    socket.on('call:decline', ({ callId, toUserId }) => {
        if (toUserId) io.to(toUserId).emit('call:decline', { callId });
    });

    socket.on('call:end', ({ callId, toUserId }) => {
        if (toUserId) io.to(toUserId).emit('call:end', { callId });
    });

    socket.on('call:signal', ({ callId, to, signal }) => {
        io.to(to).emit('call:signal', { callId, from: userId, signal });
    });

    // ----- SIGN LANGUAGE relay from Flask -> meeting room -----
    socket.on('sign:detected', ({ meetingId, word, confidence, sentence }) => {
        socket.to(`meeting:${meetingId}`).emit('sign:detected', {
            userId,
            userName: socket.user.name,
            word,
            confidence,
            sentence
        });
    });

    // ----- SPEECH-TO-TEXT transcript relay -> meeting room -----
    socket.on('stt:transcript', ({ meetingId, text, language, isFinal }) => {
        if (!text || !text.trim()) return;
        socket.to(`meeting:${meetingId}`).emit('stt:transcript', {
            userId,
            userName: socket.user.name,
            text: text.trim(),
            language: language || 'en-US',
            isFinal: !!isFinal,
            timestamp: Date.now(),
        });
    });

    // ----- ACTIVE SPEAKER broadcast -> meeting room -----
    socket.on('speaker:active', ({ meetingId, isActive }) => {
        socket.to(`meeting:${meetingId}`).emit('speaker:active', {
            userId,
            userName: socket.user.name,
            isActive: !!isActive,
        });
    });

    // ----- MIC/VIDEO/SCREEN state broadcast -> meeting room -----
    socket.on('media:state', ({ meetingId, micOn, videoOn, screenSharing }) => {
        socket.to(`meeting:${meetingId}`).emit('media:state', {
            userId,
            micOn: !!micOn,
            videoOn: !!videoOn,
            screenSharing: !!screenSharing,
        });
    });

    // ----- MEETING CHAT relay -> meeting room -----
    socket.on('meeting:chat:message', (msg) => {
        if (!msg?.meetingId) return;
        socket.to(`meeting:${msg.meetingId}`).emit('meeting:chat:message', msg);
    });

    // ----- WHITEBOARD relay -> meeting room -----
    socket.on('meeting:whiteboard:open', ({ meetingId }) => {
        if (!meetingId) return;
        socket.to(`meeting:${meetingId}`).emit('meeting:whiteboard:open', {
            userName: socket.user.name,
        });
    });

    socket.on('meeting:whiteboard:draw', ({ meetingId, data }) => {
        if (!meetingId || !data) return;
        socket.to(`meeting:${meetingId}`).emit('meeting:whiteboard:draw', { data });
    });

    socket.on('meeting:whiteboard:clear', ({ meetingId }) => {
        if (!meetingId) return;
        socket.to(`meeting:${meetingId}`).emit('meeting:whiteboard:clear');
    });

    // ----- DISCONNECT -----
    socket.on('disconnect', async () => {
        onlineUsers.delete(userId);
        socket.broadcast.emit('user:offline', { userId });

        // Remove from any meeting rooms
        meetingRooms.forEach((room, meetingId) => {
            if (room.has(userId)) {
                room.delete(userId);
                socket.to(`meeting:${meetingId}`).emit('meeting:participant:left', { userId });
                if (room.size === 0) meetingRooms.delete(meetingId);
            }
        });

        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        console.log(`[Socket] ${socket.user.name} disconnected`);
    });
});

// Error handler
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();
        server.listen(port, () => {
            console.log(`[Server] Running on port ${port} (${process.env.NODE_ENV || 'development'})`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
