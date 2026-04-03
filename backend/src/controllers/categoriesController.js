const prisma = require('../config/db');

const getUpperCategories = async (req, res) => {
  try {
    const data = await prisma.upperCategory.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        is_active: true,
        categories: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            is_active: true,
            subcategories: {
              where: { is_active: true },
              select: { id: true, name: true, is_active: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUpperCategories };