const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);