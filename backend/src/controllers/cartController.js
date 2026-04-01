const prisma = require('../db');

const getCart = async (req, res) => {
  try {
    const items = await prisma.cart.findMany({
      where: { user_id: req.user.userId },
      include: {
        variant: {
          include: {
            item: true,
            images: true,
          },
        },
        event: {
          include: { discounts: { where: { is_active: true } } },
        },
      },
      orderBy: { created_at: 'asc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { variant_id, quantity, event_id } = req.body;
    if (!variant_id || !quantity) return res.status(400).json({ error: 'variant_id and quantity required' });

    const existing = await prisma.cart.findFirst({
      where: { user_id: req.user.userId, variant_id: parseInt(variant_id), event_id: event_id ? parseInt(event_id) : null },
    });

    if (existing) {
      const updated = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + parseInt(quantity) },
      });
      return res.json(updated);
    }

    const item = await prisma.cart.create({
      data: {
        user_id: req.user.userId,
        variant_id: parseInt(variant_id),
        quantity: parseInt(quantity),
        event_id: event_id ? parseInt(event_id) : null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await prisma.cart.findFirst({
      where: { id: parseInt(req.params.id), user_id: req.user.userId },
    });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    const updated = await prisma.cart.update({
      where: { id: parseInt(req.params.id) },
      data: { quantity: parseInt(quantity) },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const item = await prisma.cart.findFirst({
      where: { id: parseInt(req.params.id), user_id: req.user.userId },
    });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    await prisma.cart.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart };
