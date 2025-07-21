const validator = require('validator');

const validateRegister = (data) => {
  const { email, password, name } = data;
  if (!email || !validator.isEmail(email)) {
    throw new Error('Invalid email');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  if (!name || name.length < 2) {
    throw new Error('Name is required');
  }
};

const validateProfileUpdate = (data) => {
  const { name, avatar, password } = data;
  if (name && name.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }
  if (avatar && !validator.isURL(avatar)) {
    throw new Error('Invalid avatar URL');
  }
  if (password && password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
};

const validateBMI = (data) => {
  const { height, weight } = data;
  if (!height || height <= 0) {
    throw new Error('Height must be a positive number');
  }
  if (!weight || weight <= 0) {
    throw new Error('Weight must be a positive number');
  }
};

const validateResetPassword = (data) => {
  const { email, password } = data;
  if (!email || !validator.isEmail(email)) {
    throw new Error('Invalid email');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
};

const validateAttendance = (data) => {
  const { scheduleId, attended } = data;
  if (!scheduleId) {
    throw new Error('Schedule ID is required');
  }
  if (typeof attended !== 'boolean') {
    throw new Error('Attended must be a boolean');
  }
};

module.exports = { validateRegister, validateProfileUpdate, validateBMI, validateResetPassword, validateAttendance };