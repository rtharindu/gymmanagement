const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  workoutPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' },
  height: { type: Number },
  weight: { type: Number },
  bmi: { type: Number },
  bmiCategory: { type: String },
});

module.exports = mongoose.model('Member', memberSchema);