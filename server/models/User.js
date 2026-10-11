const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SuperAdmin', 'President', 'HR', 'TrackHead', 'Student', 'CommitteeMember'], 
    default: 'Student' 
  },
  track: { type: String, default: 'General' }, // e.g., Flutter, Web, HR, etc.
  season: { type: String, default: '2026-2027' },
  points: { type: Number, default: 0 },
  strikes: { type: Number, default: 0 },
  attendance: [{ sessionId: mongoose.Schema.Types.ObjectId, date: Date, status: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
