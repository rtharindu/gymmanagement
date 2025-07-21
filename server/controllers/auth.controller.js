const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateRegister, validateResetPassword } = require('../utils/validators');

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    validateRegister({ email, password, name });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({ email, password, name, role });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ user: { id: user._id, name, email, role, avatar: user.avatar }, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email, role: user.role, avatar: user.avatar }, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    validateResetPassword({ email, password });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.password = password;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login, resetPassword };