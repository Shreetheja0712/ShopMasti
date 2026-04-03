const prisma = require('../config/db');

const getEvents = async (req, res) => {
  try {
    const events = await prisma.eventType.findMany({
      where: { is_active: true },
      include: {
        discounts: { where: { is_active: true } },
        subcategories: { include: { subcategory: true } },
      },
      orderBy: { id: 'asc' },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await prisma.eventType.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        discounts: { where: { is_active: true } },
        subcategories: { include: { subcategory: true } },
      },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getEvents, getEvent };
