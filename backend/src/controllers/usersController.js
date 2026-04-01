const prisma = require('../db');
const bcrypt = require('bcrypt');

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, username: true, email: true, mobile_number: true, country: true, role_id: true, created_at: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateMe = async (req, res) => {
  try {
    const { username, mobile_number, country } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { username, mobile_number, country },
      select: { id: true, username: true, email: true, mobile_number: true, country: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username already taken' });
    res.status(500).json({ error: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(new_password, 10);
    await prisma.user.update({ where: { id: req.user.userId }, data: { password: hashed } });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMe, updateMe, updatePassword };
