const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@gmail.com' });
    if (existing) {
        console.log('Admin already exists:', existing.email);
        process.exit(0);
    }

    await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
    });
    console.log('Admin created: admin@gmail.com / admin123');
    process.exit(0);
}

seed().catch(e => { console.error(e.message); process.exit(1); });
