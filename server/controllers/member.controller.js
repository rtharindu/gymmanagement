const Member = require('../models/Member');
const User = require('../models/User');

const getMembers = async (req, res) => {
  try {
    const members = await Member.find().populate('userId', 'name email avatar').populate('trainerId').populate('workoutPlanId');
    res.json(members);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getCurrentMember = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id })
      .populate('userId', 'name email avatar')
      .populate('trainerId')
      .populate('workoutPlanId');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id)
      .populate('userId', 'name email avatar')
      .populate('trainerId')
      .populate('workoutPlanId');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMembersByTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const members = await Member.find({ trainerId })
      .populate('userId', 'name email avatar')
      .populate('trainerId')
      .populate('workoutPlanId');
    res.json(members);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const assignTrainer = async (req, res) => {
  try {
    const { memberId, trainerId } = req.body;
    const member = await Member.findByIdAndUpdate(memberId, { trainerId }, { new: true })
      .populate('userId', 'name email avatar')
      .populate('trainerId');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Trainer assigned', member });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    await User.findByIdAndDelete(member.userId);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getMembers, getCurrentMember, getMemberById, getMembersByTrainer, assignTrainer, deleteMember };