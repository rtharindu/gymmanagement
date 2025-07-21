const express = require('express');
const { calculateBMI, getMemberBMI } = require('../controllers/bmi.controller');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const router = express.Router();

router.post('/calculate', auth, restrictTo('member'), calculateBMI);
router.get('/:id', auth, restrictTo('admin', 'trainer', 'member'), getMemberBMI); // New route

module.exports = router;