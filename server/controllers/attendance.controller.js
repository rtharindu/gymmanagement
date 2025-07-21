const Attendance = require('../models/Attendance');
const { validateAttendance } = require('../utils/validators');

const markAttendance = async (req, res) => {
  try {
    const { scheduleId, attended } = req.body;
    validateAttendance({ scheduleId, attended });
    const member = await Member.findOne({ userId: req.user.id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const attendance = new Attendance({ scheduleId, memberId: member._id, attended });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('scheduleId')
      .populate({ path: 'memberId', populate: { path: 'userId', select: 'name email' } });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { markAttendance, getAttendance };