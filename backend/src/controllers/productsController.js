const prisma = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const {
      q,
      subcategory,
      upper,
      category,
      eventId,
      sort,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 20,
    } = req.query;

    const where = { is_active: true };

    if (subcategory) where.subcategory_id = parseInt(subcategory);

    if (category) {
      where.subcategory = { category_id: parseInt(category) };
    }

    if (upper) {
      where.subcategory = {
        ...(where.subcategory || {}),
        category: {
          upper_category: {
            name: { contains: upper, mode: 'insensitive' },
          },
        },
      };
    }

    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    if (eventId) {
      where.subcategory = {
        ...(where.subcategory || {}),
        events: { some: { event_id: parseInt(eventId) } },
      };
    }

    // ✅ Build variant filter ONCE (important fix)
    let variantFilter = { is_active: true };

    if (minPrice || maxPrice) {
      variantFilter.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    if (inStock === 'true') {
      variantFilter.stock = { gt: 0 };
    }

    // Apply variant filter to WHERE (product level)
    if (minPrice || maxPrice || inStock === 'true') {
      where.variants = {
        some: variantFilter,
      };
    }

    // Sorting
    const baseOrderBy =
      sort === 'newest' || !sort
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
        // ✅ IMPORTANT: filter variants ALSO here
        variants: {
          where: variantFilter,
          include: { images: true },
          orderBy: { id: 'asc' },
        },
        subcategory: {
          include: {
            category: {
              include: { upper_category: true },
            },
          },
        },
      },
      skip:
        sort === 'price_asc' || sort === 'price_desc' ? 0 : skip,
      take:
        sort === 'price_asc' || sort === 'price_desc'
          ? undefined
          : parseInt(limit),
      orderBy: baseOrderBy,
    });

    // ✅ Safe price sorting
    if (sort === 'price_asc' || sort === 'price_desc') {
      items = items.sort((a, b) => {
        const aPrices = a.variants.map((v) => parseFloat(v.price));
        const bPrices = b.variants.map((v) => parseFloat(v.price));

        const aMin = aPrices.length ? Math.min(...aPrices) : Infinity;
        const bMin = bPrices.length ? Math.min(...bPrices) : Infinity;

        return sort === 'price_asc' ? aMin - bMin : bMin - aMin;
      });

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
        subcategory: {
          include: {
            category: {
              include: { upper_category: true },
            },
          },
        },
        reviews: {
          include: {
            user: { select: { username: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: 'Rating must be between 1 and 5' });
    }

    const itemId = parseInt(req.params.id);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await prisma.review.findFirst({
      where: {
        item_id: itemId,
        user_id: req.user.userId,
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: 'You have already reviewed this product' });
    }

    const review = await prisma.review.create({
      data: {
        item_id: itemId,
        user_id: req.user.userId,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProducts, getProduct, createReview };