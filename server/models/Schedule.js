const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  title: { type: String, required: true },
});

module.exports = mongoose.model('Schedule', scheduleSchema);