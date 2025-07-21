const express = require('express');
const { createWorkoutPlan, getWorkoutPlans, getMemberWorkoutPlan, assignWorkoutPlan } = require('../controllers/workoutPlan.controller');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const router = express.Router();

router.post('/', auth, restrictTo('admin', 'trainer'), createWorkoutPlan);
router.get('/', auth, restrictTo('admin', 'trainer'), getWorkoutPlans);
router.get('/me', auth, restrictTo('member'), getMemberWorkoutPlan);
router.post('/assign', auth, restrictTo('admin', 'trainer'), assignWorkoutPlan);

module.exports = router;