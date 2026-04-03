const prisma = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const { q, subcategory, upper, category, eventId, sort, minPrice, maxPrice, inStock, page = 1, limit = 20 } = req.query;
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

    // eventId filter: only show products whose subcategory is linked to this event
    if (eventId) {
      where.subcategory = {
        ...(where.subcategory || {}),
        events: { some: { event_id: parseInt(eventId) } },
      };
    }

    // Price filter — applied via variant price range
    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          is_active: true,
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        },
      };
    }

    // In-stock filter
    if (inStock === 'true') {
      where.variants = {
        ...(where.variants || {}),
        some: {
          ...(where.variants?.some || { is_active: true }),
          stock: { gt: 0 },
        },
      };
    }

    // Sorting — price sorting done in-memory since Prisma doesn't support orderBy on aggregate of relation
    const sortableByName = sort === 'name_asc';
    const baseOrderBy = sort === 'newest' || !sort
      ? { id: 'desc' }
      : sort === 'name_asc'
      ? { name: 'asc' }
      : sort === 'discount'
      ? { base_discount: 'desc' }
      : { id: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let items = await prisma.item.findMany({
      where,
      include: {
        variants: {
          where: { is_active: true },
          include: { images: true },
          orderBy: { id: 'asc' },
        },
        subcategory: { include: { category: { include: { upper_category: true } } } },
      },
      skip: (sort === 'price_asc' || sort === 'price_desc') ? 0 : skip,
      take: (sort === 'price_asc' || sort === 'price_desc') ? undefined : parseInt(limit),
      orderBy: baseOrderBy,
    });

    // In-memory price sort
    if (sort === 'price_asc' || sort === 'price_desc') {
      items = items.sort((a, b) => {
        const aMin = Math.min(...(a.variants.map(v => parseFloat(v.price)) || [Infinity]));
        const bMin = Math.min(...(b.variants.map(v => parseFloat(v.price)) || [Infinity]));
        return sort === 'price_asc' ? aMin - bMin : bMin - aMin;
      });
      // Apply pagination after sorting
      items = items.slice(skip, skip + parseInt(limit));
    }

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
        reviews: { include: { user: { select: { username: true } } }, orderBy: { created_at: 'desc' } },
      },
    });
    if (!item) return res.status(404).json({ error: 'Product not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const itemId = parseInt(req.params.id);

    // Check product exists
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Product not found' });

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { item_id: itemId, user_id: req.user.userId },
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    const review = await prisma.review.create({
      data: {
        item_id: itemId,
        user_id: req.user.userId,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: { user: { select: { username: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProducts, getProduct, createReview };