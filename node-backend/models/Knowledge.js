const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    keywords: [String],
    answer: String,
    category: String
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);
