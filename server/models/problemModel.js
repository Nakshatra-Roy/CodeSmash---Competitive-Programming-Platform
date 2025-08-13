const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  tags: [String],
  constraints: [String],
  examples: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);