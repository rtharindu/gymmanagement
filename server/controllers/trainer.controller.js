const Member = require('../models/Member');
const Trainer = require('../models/Trainer');

const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const trainer = await Trainer.findOneAndUpdate(
      { userId: req.user.id },
      { availability },
      { new: true }
    );
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json({ message: 'Availability updated', trainer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTrainerMembers = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    const members = await Member.find({ trainerId: trainer._id })
      .populate('userId', 'name email avatar')
      .populate('workoutPlanId');
    res.json(members);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().populate('userId', 'name email avatar');
    res.json(trainers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { updateAvailability, getTrainerMembers, getTrainers };