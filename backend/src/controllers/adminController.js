const prisma = require('../db');

// Stats
const getStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, totalEvents] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.item.count(),
      prisma.eventType.count(),
    ]);
    const revenueAgg = await prisma.order.aggregate({ _sum: { final_amount: true } });
    res.json({
      totalOrders, totalUsers, totalProducts, totalEvents,
      totalRevenue: parseFloat(revenueAgg._sum.final_amount || 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Events
const getAdminEvents = async (req, res) => {
  try {
    const events = await prisma.eventType.findMany({
      include: { discounts: true, subcategories: { include: { subcategory: true } } },
      orderBy: { id: 'desc' },
    });
    res.json(events);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const createEvent = async (req, res) => {
  try {
    const { name, description, banner_image, is_active } = req.body;
    const event = await prisma.eventType.create({ data: { name, description, banner_image, is_active: is_active !== false } });
    res.status(201).json(event);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const updateEvent = async (req, res) => {
  try {
    const { name, description, banner_image, is_active } = req.body;
    const event = await prisma.eventType.update({ where: { id: parseInt(req.params.id) }, data: { name, description, banner_image, is_active } });
    res.json(event);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const deleteEvent = async (req, res) => {
  try {
    await prisma.eventType.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Event deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const getEventDiscounts = async (req, res) => {
  try {
    const discounts = await prisma.eventDiscount.findMany({ where: { event_id: parseInt(req.params.id) } });
    res.json(discounts);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const createEventDiscount = async (req, res) => {
  try {
    const { min_purchase_amount, discount_amount, is_active } = req.body;
    const d = await prisma.eventDiscount.create({
      data: { event_id: parseInt(req.params.id), min_purchase_amount: parseFloat(min_purchase_amount), discount_amount: parseFloat(discount_amount), is_active: is_active !== false },
    });
    res.status(201).json(d);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const deleteEventDiscount = async (req, res) => {
  try {
    await prisma.eventDiscount.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Products
const getAdminProducts = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: { variants: { include: { images: true } }, subcategory: { include: { category: true } } },
      orderBy: { id: 'desc' },
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, base_discount, subcategory_id, is_active, variants } = req.body;
    const item = await prisma.item.create({
      data: {
        name, description,
        base_discount: base_discount ? parseFloat(base_discount) : null,
        subcategory_id: parseInt(subcategory_id),
        is_active: is_active !== false,
        variants: variants?.length ? {
          create: variants.map(v => ({
            color: v.color, size: v.size, price: parseFloat(v.price), stock: parseInt(v.stock),
          })),
        } : undefined,
      },
      include: { variants: true },
    });
    res.status(201).json(item);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, base_discount, subcategory_id, is_active } = req.body;
    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, base_discount: base_discount ? parseFloat(base_discount) : null, subcategory_id: subcategory_id ? parseInt(subcategory_id) : undefined, is_active },
    });
    res.json(item);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Categories
const getAdminCategories = async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ include: { subcategories: true, upper_category: true }, orderBy: { id: 'asc' } });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, upper_category_id, is_active } = req.body;
    const cat = await prisma.category.create({ data: { name, description, upper_category_id: upper_category_id ? parseInt(upper_category_id) : null, is_active: is_active !== false } });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, upper_category_id, is_active } = req.body;
    const cat = await prisma.category.update({ where: { id: parseInt(req.params.id) }, data: { name, description, upper_category_id: upper_category_id ? parseInt(upper_category_id) : null, is_active } });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Upper Categories
const getAdminUpperCategories = async (req, res) => {
  try {
    const cats = await prisma.upperCategory.findMany({ include: { categories: true }, orderBy: { id: 'asc' } });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const createUpperCategory = async (req, res) => {
  try {
    const { name, is_active } = req.body;
    const cat = await prisma.upperCategory.create({ data: { name, is_active: is_active !== false } });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const updateUpperCategory = async (req, res) => {
  try {
    const { name, is_active } = req.body;
    const cat = await prisma.upperCategory.update({ where: { id: parseInt(req.params.id) }, data: { name, is_active } });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const deleteUpperCategory = async (req, res) => {
  try {
    await prisma.upperCategory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Subcategories
const getAdminSubcategories = async (req, res) => {
  try {
    const subs = await prisma.subCategory.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
    res.json(subs);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const createSubcategory = async (req, res) => {
  try {
    const { name, description, category_id, is_active } = req.body;
    const sub = await prisma.subCategory.create({ data: { name, description, category_id: parseInt(category_id), is_active: is_active !== false } });
    res.status(201).json(sub);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const updateSubcategory = async (req, res) => {
  try {
    const { name, description, category_id, is_active } = req.body;
    const sub = await prisma.subCategory.update({ where: { id: parseInt(req.params.id) }, data: { name, description, category_id: category_id ? parseInt(category_id) : undefined, is_active } });
    res.json(sub);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const deleteSubcategory = async (req, res) => {
  try {
    await prisma.subCategory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Orders
const getAdminOrders = async (req, res) => {
  try {
    const { limit } = req.query;
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: { include: { variant: { include: { item: true } } } },
        address: true,
        event: true,
      },
      orderBy: { created_at: 'desc' },
      ...(limit ? { take: parseInt(limit) } : {}),
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: parseInt(req.params.id) }, data: { status } });
    res.json(order);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Users
const getAdminUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, mobile_number: true, is_active: true, role_id: true, created_at: true },
      orderBy: { id: 'asc' },
    });
    res.json(users);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { is_active } });
    res.json({ id: user.id, is_active: user.is_active });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

module.exports = {
  getStats,
  getAdminEvents, createEvent, updateEvent, deleteEvent,
  getEventDiscounts, createEventDiscount, deleteEventDiscount,
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
  getAdminUpperCategories, createUpperCategory, updateUpperCategory, deleteUpperCategory,
  getAdminSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
  getAdminOrders, updateOrderStatus,
  getAdminUsers, toggleUserStatus,
};