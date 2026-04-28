const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    // Allow Demo Mode Token for testing
    if (token.startsWith('DEMO_MODE_TOKEN_')) {
        req.user = '662e6e2e6e2e6e2e6e2e6e2e'; // Dummy ObjectId
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

router.get('/data', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user, transactions: user.transactions || [] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/transaction', auth, async (req, res) => {
    try {
        const { date, desc, cat, stat, amt, updateBalance } = req.body;
        
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const transaction = new Transaction({
            userId: req.user,
            date,
            desc,
            cat,
            stat,
            amt
        });

        await transaction.save();

        if (updateBalance) {
            user.balance += amt;
            await user.save();
        }

        res.json({ transaction, balance: user.balance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/update', auth, async (req, res) => {
    try {
        const updateFields = req.body;
        const user = await User.findByIdAndUpdate(req.user, { $set: updateFields }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const Knowledge = require('../models/Knowledge');

// --- AI CHATBOT ROUTER (Gemini + MongoDB) ---
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, context } = req.body;
        const query = message.toLowerCase();
        
        // 1. Specific dynamic balance/spending logic (Prioritize real data)
        if (/bal|blance|money|funds|how much/.test(query)) {
            return res.json({ reply: `Your current Nexus Core Balance is ₹${(context?.balance || 0).toLocaleString()}. Your assets are secure in the neural vault.` });
        }
        
        if (/spend|spent|expense|kharcha/.test(query)) {
            const transactions = context?.transactions || [];
            const totalSpent = transactions.filter(t => t.amt < 0).reduce((acc, curr) => acc + Math.abs(curr.amt), 0);
            return res.json({ reply: `Total expenditure synced: ₹${totalSpent.toLocaleString()}. Category breakdown is available in the Analytics module.` });
        }

        // 2. Check database for pre-defined knowledge
        const allKnowledge = await Knowledge.find();
        let dbMatch = allKnowledge.find(k => k.keywords.some(kw => query.includes(kw)));
        if (dbMatch) {
            return res.json({ reply: dbMatch.answer });
        }

        // 3. Fallback to Google Gemini (Real-World AI)
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are Nexus AI, a sophisticated financial assistant for the NEXUS Banking System.
            User's Current Balance: ₹${context?.balance}
            User's Points: ${context?.points}
            User Message: "${message}"
            Keep your response professional, slightly futuristic (stealth bank style), and helpful. Max 2-3 sentences.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return res.json({ reply: response.text() });
        }

        res.json({ reply: "I've noted your input. My cognitive layers are still optimizing. You can ask about your balance, transactions, or financial tips!" });

    } catch (err) {
        console.error('AI Error:', err.message);
        res.status(500).json({ reply: "Neural network interference detected. Please re-synchronize your connection." });
    }
});

module.exports = router;
