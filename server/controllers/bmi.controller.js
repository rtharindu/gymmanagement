const Member = require('../models/Member');
const { validateBMI } = require('../utils/validators');

const calculateBMI = async (req, res) => {
  try {
    const { memberId, height, weight } = req.body;
    validateBMI({ height, weight });
    const bmi = weight / ((height / 100) ** 2);
    let category;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    const member = await Member.findByIdAndUpdate(
      memberId,
      { height, weight, bmi, bmiCategory: category },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'BMI calculated', bmi, category, member });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMemberBMI = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id).select('height weight bmi bmiCategory');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ bmi: member.bmi, category: member.bmiCategory, height: member.height, weight: member.weight });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { calculateBMI, getMemberBMI };