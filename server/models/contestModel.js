const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  banner: { type: String, default: 'default-banner-url' , required: true },
  duration: { type: Number, required: true }, // in minutes
  organizer: { type: String, required: true },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true }],
  status: { type: String, enum: ['Pending', 'Rejected', 'Upcoming', 'Ongoing', 'Completed'], default: 'Pending' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{type: String, required: true}],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', contestSchema);