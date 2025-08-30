const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy', required: true },
  tags: [{type: String, required: true}],
  constraints: [{type: String, required: true}],
  examples: [{type: String, required: true}],
  status: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Pending' },
  submissions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);