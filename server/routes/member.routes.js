const express = require('express');
const { getMembers, getCurrentMember, assignTrainer, deleteMember, getMemberById, getMembersByTrainer } = require('../controllers/member.controller');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, restrictTo('admin'), getMembers);
router.get('/list', auth, restrictTo('admin'), getMembers); // Alias for potential frontend mismatch
router.get('/me', auth, restrictTo('member'), getCurrentMember);
router.get('/:id', auth, restrictTo('admin', 'trainer', 'member'), getMemberById);
router.get('/trainer/:trainerId', auth, restrictTo('trainer'), getMembersByTrainer); // New route
router.post('/assign-trainer', auth, restrictTo('admin'), assignTrainer);
router.delete('/:id', auth, restrictTo('admin'), deleteMember);

module.exports = router;