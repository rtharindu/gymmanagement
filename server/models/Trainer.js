const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availability: [{ day: String, timeSlots: [String] }],
});

module.exports = mongoose.model('Trainer', trainerSchema);