const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const testUser = new User({
            fullName: 'Kajal Kumari',
            email: 'kajal@test.com',
            password: 'password123',
            balance: 50000,
            isKycVerified: true
        });

        await testUser.save();
        console.log('Test User Created Successfully!');
        
        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
