const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getProducts, getProduct, createReview } = require('../controllers/productsController');

// GET /api/products        — list with filters: q, subcategory, upper, category, eventId, sort, minPrice, maxPrice, inStock
// GET /api/products/:id    — single product
// POST /api/products/:id/reviews — submit a review (auth required)
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/:id/reviews', authenticate, createReview);

module.exports = router;