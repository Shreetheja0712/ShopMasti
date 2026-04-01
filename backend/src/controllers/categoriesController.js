const prisma = require('../db');

const getUpperCategories = async (req, res) => {
  try {
    const data = await prisma.upperCategory.findMany({
      where: { is_active: true },
      include: {
        categories: {
          where: { is_active: true },
          include: {
            subcategories: { where: { is_active: true }, select: { id: true, name: true } },
          },
          select: { id: true, name: true, subcategories: true },
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
