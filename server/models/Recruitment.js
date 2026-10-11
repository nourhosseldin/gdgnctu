const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  trackPreference: { type: String, required: true },
  whyJoin: String,
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interviewed', 'Accepted', 'Rejected'], 
    default: 'Applied' 
  },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
