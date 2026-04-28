const mongoose = require('mongoose');
const Knowledge = require('./models/Knowledge');
require('dotenv').config();

const premiumData = [
    { 
        keywords: ['who are you', 'tell me about yourself', 'identity'], 
        answer: 'I am the Nexus Neural Core, a state-of-the-art financial AI designed to manage your assets with quantum-level precision. My goal is your financial dominance.', 
        category: 'general' 
    },
    { 
        keywords: ['how to grow money', 'investment advice', 'wealth'], 
        answer: 'Nexus recommends a multi-node strategy: 40% Blue-chip Equity, 30% Digital Assets, 20% Bullion, and 10% Liquidity. Always maintain a risk-aware profile.', 
        category: 'investment' 
    },
    { 
        keywords: ['is my money safe', 'security', 'hacking'], 
        answer: 'Your assets are protected by Nexus Cryptic-Shield protocols and multi-factor biometric authentication. Every transaction is verified through our private ledger cluster.', 
        category: 'security' 
    },
    { 
        keywords: ['hello', 'hi', 'nexus'], 
        answer: 'Greetings, User. Systems are at 100% capacity. How can I assist with your financial execution today?', 
        category: 'general' 
    },
    {
        keywords: ['kajal', 'owner', 'boss'],
        answer: 'Kajal Kumari is the Chief Architect of the Nexus System. Her vision drives our neural development.',
        category: 'general'
    }
];

const seedPremium = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Injecting Premium Knowledge Nodes...');
        for(let item of premiumData) {
            await Knowledge.findOneAndUpdate(
                { keywords: item.keywords[0] }, 
                item, 
                { upsert: true }
            );
        }
        console.log('Premium Sync Complete!');
        process.exit();
    } catch (err) {
        console.error('Premium Sync Error:', err);
        process.exit(1);
    }
};

seedPremium();
