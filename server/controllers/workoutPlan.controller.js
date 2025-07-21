const WorkoutPlan = require('../models/WorkoutPlan');
const Member = require('../models/Member');

const createWorkoutPlan = async (req, res) => {
  try {
    const { title, description, exercises } = req.body;
    const workoutPlan = new WorkoutPlan({
      title,
      description,
      exercises,
      createdBy: req.user.id,
    });
    await workoutPlan.save();
    res.status(201).json({ message: 'Workout plan created', workoutPlan });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getWorkoutPlans = async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find().populate('createdBy', 'name');
    res.json(workoutPlans);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMemberWorkoutPlan = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id }).populate('workoutPlanId');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member.workoutPlanId || {});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const assignWorkoutPlan = async (req, res) => {
  try {
    const { memberId, workoutPlanId } = req.body;
    const member = await Member.findByIdAndUpdate(memberId, { workoutPlanId }, { new: true })
      .populate('workoutPlanId');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Workout plan assigned', member });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createWorkoutPlan, getWorkoutPlans, getMemberWorkoutPlan, assignWorkoutPlan };