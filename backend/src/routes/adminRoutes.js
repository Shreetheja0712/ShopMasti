const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const admin = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', admin.getStats);

// Events
router.get('/events', admin.getAdminEvents);
router.post('/events', admin.createEvent);
router.put('/events/:id', admin.updateEvent);
router.delete('/events/:id', admin.deleteEvent);
router.get('/events/:id/discounts', admin.getEventDiscounts);
router.post('/events/:id/discounts', admin.createEventDiscount);
router.delete('/events/discounts/:id', admin.deleteEventDiscount);

// Products
router.get('/products', admin.getAdminProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);

// Upper Categories
router.get('/upper-categories', admin.getAdminUpperCategories);
router.post('/upper-categories', admin.createUpperCategory);
router.put('/upper-categories/:id', admin.updateUpperCategory);
router.delete('/upper-categories/:id', admin.deleteUpperCategory);

// Categories
router.get('/categories', admin.getAdminCategories);
router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Subcategories
router.get('/subcategories', admin.getAdminSubcategories);
router.post('/subcategories', admin.createSubcategory);
router.put('/subcategories/:id', admin.updateSubcategory);
router.delete('/subcategories/:id', admin.deleteSubcategory);

// Orders
router.get('/orders', admin.getAdminOrders);
router.put('/orders/:id/status', admin.updateOrderStatus);

// Users
router.get('/users', admin.getAdminUsers);
router.put('/users/:id/toggle', admin.toggleUserStatus);

module.exports = router;
