const User = require('../models/User');
const { validateProfileUpdate } = require('../utils/validators');

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, password } = req.body;
    validateProfileUpdate({ name, avatar, password });
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (password) updates.password = password;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { updateProfile };