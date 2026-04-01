const express = require('express');
const router = express.Router();
const { getProducts, getProduct } = require('../controllers/productsController');

// GET /api/products        — list with filters: q, subcategory, upper, category, eventId
// GET /api/products/:id    — single product
router.get('/', getProducts);
router.get('/:id', getProduct);

module.exports = router;
