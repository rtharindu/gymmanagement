const Schedule = require('../models/Schedule');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');

const createSchedule = async (req, res) => {
  try {
    const { trainerId, memberId, startTime, endTime, title } = req.body;
    const schedule = new Schedule({ trainerId, memberId, startTime, endTime, title });
    await schedule.save();
    res.status(201).json({ message: 'Schedule created', schedule });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('trainerId')
      .populate('memberId')
      .populate({ path: 'memberId', populate: { path: 'userId', select: 'name email' } });
    res.json(schedules);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMemberSchedules = async (req, res) => {
  try {
    let memberId;
    if (req.query.member) {
      memberId = req.query.member;
    } else {
      const member = await Member.findOne({ userId: req.user.id });
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      memberId = member._id;
    }
    const schedules = await Schedule.find({ memberId })
      .populate('trainerId')
      .populate({ path: 'memberId', populate: { path: 'userId', select: 'name email' } });
    res.json(schedules);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTrainerSchedules = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    const schedules = await Schedule.find({ trainerId: trainer._id })
      .populate('memberId')
      .populate({ path: 'memberId', populate: { path: 'userId', select: 'name email' } });
    res.json(schedules);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createSchedule, getSchedules, getMemberSchedules, getTrainerSchedules, deleteSchedule };