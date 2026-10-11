const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  speaker: String,
  location: String,
  type: { type: String, enum: ['Upcoming', 'Past', 'Workshop'], default: 'Upcoming' },
  season: { type: String, default: '2026-2027' },
  attendeesCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Event', eventSchema);
