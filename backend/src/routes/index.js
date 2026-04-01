/**
 * routes/index.js
 * Master router — mounts every domain router at its prefix.
 * All logic lives in the individual route files.
 */
const express = require('express');
const router = express.Router();

const authRoutes        = require('./authRoutes');
const usersRoutes       = require('./usersRoutes');
const categoriesRoutes  = require('./categoriesRoutes');
const productsRoutes    = require('./productsRoutes');
const eventsRoutes      = require('./eventsRoutes');
const cartRoutes        = require('./cartRoutes');
const addressesRoutes   = require('./addressesRoutes');
const ordersRoutes      = require('./ordersRoutes');
const adminRoutes       = require('./adminRoutes');

router.use('/auth',             authRoutes);        // POST /api/auth/register, /api/auth/login
router.use('/users',            usersRoutes);       // GET/PUT /api/users/me, /api/users/me/password
router.use('/upper-categories', categoriesRoutes);  // GET /api/upper-categories
router.use('/products',         productsRoutes);    // GET /api/products, /api/products/:id
router.use('/events',           eventsRoutes);      // GET /api/events, /api/events/:id
router.use('/cart',             cartRoutes);        // GET/POST/PUT/DELETE /api/cart
router.use('/addresses',        addressesRoutes);   // CRUD /api/addresses
router.use('/orders',           ordersRoutes);      // GET/POST /api/orders
router.use('/admin',            adminRoutes);       // All /api/admin/* routes

module.exports = router;
