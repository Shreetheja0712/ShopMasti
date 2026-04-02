const prisma = require('../config/db');

// Stats
const getStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, totalEvents] = await Promise.all([
      prisma.orders.count(),
      prisma.user.count(),
      prisma.item.count(),
      prisma.eventType.count(),
    ]);
    const revenueAgg = await prisma.orders.aggregate({ _sum: { final_amount: true } });
    res.json({
      totalOrders, totalUsers, totalProducts, totalEvents,
      totalRevenue: parseFloat(revenueAgg._sum.final_amount || 0),
    });
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ error: err.message });
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
  } catch (err) {
    console.error('getAdminEvents error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { name, description, banner_image, is_active } = req.body;
    const event = await prisma.eventType.create({ data: { name, description, banner_image, is_active: is_active !== false } });
    res.status(201).json(event);
  } catch (err) {
    console.error('createEvent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { name, description, banner_image, is_active } = req.body;
    const event = await prisma.eventType.update({ where: { id: parseInt(req.params.id) }, data: { name, description, banner_image, is_active } });
    res.json(event);
  } catch (err) {
    console.error('updateEvent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await prisma.eventType.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('deleteEvent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getEventDiscounts = async (req, res) => {
  try {
    const discounts = await prisma.eventDiscount.findMany({ where: { event_id: parseInt(req.params.id) } });
    res.json(discounts);
  } catch (err) {
    console.error('getEventDiscounts error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const createEventDiscount = async (req, res) => {
  try {
    const { min_purchase_amount, discount_amount, is_active } = req.body;
    const d = await prisma.eventDiscount.create({
      data: { event_id: parseInt(req.params.id), min_purchase_amount: parseFloat(min_purchase_amount), discount_amount: parseFloat(discount_amount), is_active: is_active !== false },
    });
    res.status(201).json(d);
  } catch (err) {
    console.error('createEventDiscount error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteEventDiscount = async (req, res) => {
  try {
    await prisma.eventDiscount.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteEventDiscount error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Products
const getAdminProducts = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: { variants: { include: { images: true } }, subcategory: { include: { category: true } } },
      orderBy: { id: 'desc' },
    });
    res.json(items);
  } catch (err) {
    console.error('getAdminProducts error:', err.message);
    res.status(500).json({ error: err.message });
  }
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
  } catch (err) {
    console.error('createProduct error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, base_discount, subcategory_id, is_active } = req.body;
    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, base_discount: base_discount ? parseFloat(base_discount) : null, subcategory_id: subcategory_id ? parseInt(subcategory_id) : undefined, is_active },
    });
    res.json(item);
  } catch (err) {
    console.error('updateProduct error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Categories
const getAdminCategories = async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ include: { subcategories: true, upper_category: true }, orderBy: { id: 'asc' } });
    res.json(cats);
  } catch (err) {
    console.error('getAdminCategories error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, upper_category_id, is_active } = req.body;
    const cat = await prisma.category.create({ data: { name, description, upper_category_id: upper_category_id ? parseInt(upper_category_id) : null, is_active: is_active !== false } });
    res.status(201).json(cat);
  } catch (err) {
    console.error('createCategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, upper_category_id, is_active } = req.body;
    const cat = await prisma.category.update({ where: { id: parseInt(req.params.id) }, data: { name, description, upper_category_id: upper_category_id ? parseInt(upper_category_id) : null, is_active } });
    res.json(cat);
  } catch (err) {
    console.error('updateCategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteCategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Upper Categories
const getAdminUpperCategories = async (req, res) => {
  try {
    const cats = await prisma.upperCategory.findMany({ include: { categories: true }, orderBy: { id: 'asc' } });
    res.json(cats);
  } catch (err) {
    console.error('getAdminUpperCategories error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const createUpperCategory = async (req, res) => {
  try {
    const { name, is_active } = req.body;
    const cat = await prisma.upperCategory.create({ data: { name, is_active: is_active !== false } });
    res.status(201).json(cat);
  } catch (err) {
    console.error('createUpperCategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateUpperCategory = async (req, res) => {
  try {
    const { name, is_active } = req.body;
    const cat = await prisma.upperCategory.update({ where: { id: parseInt(req.params.id) }, data: { name, is_active } });
    res.json(cat);
  } catch (err) {
    console.error('updateUpperCategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteUpperCategory = async (req, res) => {
  try {
    await prisma.upperCategory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteUpperCategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Subcategories
const getAdminSubcategories = async (req, res) => {
  try {
    const subs = await prisma.subCategory.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
    res.json(subs);
  } catch (err) {
    console.error('getAdminSubcategories error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const createSubcategory = async (req, res) => {
  try {
    const { name, description, category_id, is_active } = req.body;
    const sub = await prisma.subCategory.create({ data: { name, description, category_id: parseInt(category_id), is_active: is_active !== false } });
    res.status(201).json(sub);
  } catch (err) {
    console.error('createSubcategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { name, description, category_id, is_active } = req.body;
    const sub = await prisma.subCategory.update({ where: { id: parseInt(req.params.id) }, data: { name, description, category_id: category_id ? parseInt(category_id) : undefined, is_active } });
    res.json(sub);
  } catch (err) {
    console.error('updateSubcategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    await prisma.subCategory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteSubcategory error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Orders
const getAdminOrders = async (req, res) => {
  try {
    const { limit } = req.query;
    const orders = await prisma.orders.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: { include: { variant: { include: { item: true } } } },
        address: true,
        event: true,
      },
      orderBy: { order_date: 'desc' },  // ← fixed: was created_at
      ...(limit ? { take: parseInt(limit) } : {}),
    });
    res.json(orders);
  } catch (err) {
    console.error('getAdminOrders error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const order = await prisma.orders.update({
      where: { id: parseInt(req.params.id) },
      data: { status: status.toUpperCase() },  // ← normalize to uppercase to match DB enum
    });
    res.json({ id: order.id, status: order.status });
  } catch (err) {
    console.error('updateOrderStatus error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Users
const getAdminUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, mobile_number: true, is_active: true, role_id: true, created_at: true },
      orderBy: { id: 'asc' },
    });
    res.json(users);
  } catch (err) {
    console.error('getAdminUsers error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { is_active } });
    res.json({ id: user.id, is_active: user.is_active });
  } catch (err) {
    console.error('toggleUserStatus error:', err.message);
    res.status(500).json({ error: err.message });
  }
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