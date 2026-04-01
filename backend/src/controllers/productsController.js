const prisma = require('../db');

const getProducts = async (req, res) => {
  try {
    const { q, subcategory, upper, category, eventId, page = 1, limit = 20 } = req.query;
    const where = { is_active: true };
    if (subcategory) where.subcategory_id = parseInt(subcategory);
    if (category) {
      where.subcategory = { category_id: parseInt(category) };
    }
    if (upper) {
      where.subcategory = {
        ...(where.subcategory || {}),
        category: { upper_category: { name: { contains: upper, mode: 'insensitive' } } },
      };
    }
    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await prisma.item.findMany({
      where,
      include: {
        variants: {
          where: { is_active: true },
          include: { images: true },
          orderBy: { id: 'asc' },
        },
        subcategory: { include: { category: { include: { upper_category: true } } } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { id: 'desc' },
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProduct = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        variants: {
          where: { is_active: true },
          include: { images: true },
        },
        subcategory: { include: { category: { include: { upper_category: true } } } },
        reviews: { include: { user: { select: { username: true } } } },
      },
    });
    if (!item) return res.status(404).json({ error: 'Product not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProducts, getProduct };
