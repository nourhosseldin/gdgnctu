const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
