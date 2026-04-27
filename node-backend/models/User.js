const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 12450.00 },
    goldWeight: { type: Number, default: 12.45 },
    ppfBalance: { type: Number, default: 150000.00 },
    dematValue: { type: Number, default: 42850.00 },
    points: { type: Number, default: 12450 },
    isKycVerified: { type: Boolean, default: false },
    theme: { type: String, default: 'dark' },
    transactions: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
