const express = require('express');
const { createSchedule, getSchedules, getMemberSchedules, getTrainerSchedules, deleteSchedule } = require('../controllers/schedule.controller');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const router = express.Router();

router.post('/', auth, restrictTo('admin', 'trainer', 'member'), createSchedule);
router.get('/', auth, restrictTo('admin'), getSchedules);
router.get('/schedules', auth, restrictTo('admin', 'trainer'), getMemberSchedules); // Alias for frontend mismatch
router.get('/me', auth, restrictTo('member'), getMemberSchedules);
router.get('/trainer', auth, restrictTo('trainer'), getTrainerSchedules);
router.delete('/:id', auth, restrictTo('admin', 'trainer', 'member'), deleteSchedule); // New route

module.exports = router;