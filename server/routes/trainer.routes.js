const express = require('express');
const { updateAvailability, getTrainerMembers, getTrainers } = require('../controllers/trainer.controller');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const router = express.Router();

router.put('/availability', auth, restrictTo('trainer'), updateAvailability);
router.get('/members', auth, restrictTo('trainer'), getTrainerMembers);
router.get('/', auth, restrictTo('admin', 'member'), getTrainers); // New route

module.exports = router;