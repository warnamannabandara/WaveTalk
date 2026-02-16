import { MoreVertical, Send, Paperclip, Smile, Mic, Phone, Video } from 'lucide-react';

const ChatArea = () => {
    const messages = [
        {
            id: 1,
            text: "Hey team! Just finished the quarterly report. Ready for review.",
            time: "10:30 AM",
            isMe: false,
            sender: "User"
        },
        {
            id: 2,
            text: "Great work! I'll review it this afternoon.",
            time: "10:32 AM",
            isMe: true,
            sender: "Me"
        },
        {
            id: 3,
            text: "Thanks! Let me know if you need any changes.",
            time: "10:35 AM",
            isMe: false,
            sender: "User"
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#15231D] relative">
            {/* Chat Header */}
            <div className="h-16 border-b border-[#2A3430] flex items-center justify-between px-6 bg-[#1A231F]">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-700/50 flex items-center justify-center text-emerald-100 font-medium text-sm">
                        PA
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Project Alpha Team</h2>
                        <p className="text-xs text-emerald-400">12 members</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-emerald-400 transition-colors"><Phone className="w-4 h-4" /></button>
                    <button className="hover:text-emerald-400 transition-colors"><Video className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-[#2A3430]" />
                    <button className="hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Date divider example */}
                <div className="flex justify-center">
                    <span className="text-[10px] font-medium text-gray-600 bg-[#1A231F] px-2 py-1 rounded-full border border-[#2A3430]">Today</span>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                        {!msg.isMe && (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
                        )}
                        <div className={`max-w-[70%] group relative`}>
                            <div
                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isMe
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-[#1A2C24] text-gray-200 rounded-bl-none border border-[#2A4034]'
                                    }`}
                            >
                                {msg.text}
                            </div>
                            <span className={`text-[10px] text-gray-500 mt-1 block ${msg.isMe ? 'text-right pr-1' : 'pl-1'}`}>
                                {msg.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#2A3430] bg-[#1A231F]">
                <div className="bg-[#151b18] border border-[#2A3430] rounded-xl flex items-center p-2 gap-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
                    <button className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                        <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none px-2"
                    />
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <Smile className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
