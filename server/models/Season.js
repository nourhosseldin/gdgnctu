const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "2026-2027"
  active: { type: Boolean, default: true },
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    trainingHours: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Season', seasonSchema);
