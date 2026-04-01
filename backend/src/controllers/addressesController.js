const prisma = require('../db');

const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { user_id: req.user.userId },
      orderBy: [{ is_default: 'desc' }, { id: 'asc' }],
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createAddress = async (req, res) => {
  try {
    const { full_name, mobile_number, house_no, street, city, state, pincode, country, address_type, is_default } = req.body;
    if (is_default) {
      await prisma.address.updateMany({ where: { user_id: req.user.userId }, data: { is_default: false } });
    }
    const addr = await prisma.address.create({
      data: { full_name, mobile_number, house_no, street, city, state, pincode, country, address_type, is_default: !!is_default, user_id: req.user.userId },
    });
    res.status(201).json(addr);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { full_name, mobile_number, house_no, street, city, state, pincode, country, address_type, is_default } = req.body;
    const addr = await prisma.address.findFirst({ where: { id: parseInt(req.params.id), user_id: req.user.userId } });
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    if (is_default) {
      await prisma.address.updateMany({ where: { user_id: req.user.userId }, data: { is_default: false } });
    }
    const updated = await prisma.address.update({
      where: { id: parseInt(req.params.id) },
      data: { full_name, mobile_number, house_no, street, city, state, pincode, country, address_type, is_default: !!is_default },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addr = await prisma.address.findFirst({ where: { id: parseInt(req.params.id), user_id: req.user.userId } });
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    await prisma.address.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };
