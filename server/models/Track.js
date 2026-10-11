const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: String,
  resourcesUrl: String,
  taskDescription: String,
  taskDeadline: Date,
  points: { type: Number, default: 10 }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const trackSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Technical', 'Non-Technical'], required: true },
  description: String,
  trackHead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modules: [moduleSchema],
  season: { type: String, default: '2026-2027' }
});

module.exports = mongoose.model('Track', trackSchema);
