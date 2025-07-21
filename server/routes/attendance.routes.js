const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendance.controller');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const router = express.Router();

router.post('/', auth, restrictTo('member'), markAttendance);
router.get('/', auth, restrictTo('admin', 'trainer'), getAttendance);

module.exports = router;