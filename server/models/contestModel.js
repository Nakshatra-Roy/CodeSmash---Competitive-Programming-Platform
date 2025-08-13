const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  banner: { type: String, default: 'default-banner-url' , required: true },
  duration: { type: Number, required: true }, // in minutes
  organizer: { type: String, required: true },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', contestSchema);