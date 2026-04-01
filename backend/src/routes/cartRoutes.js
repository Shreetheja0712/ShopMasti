const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getCart, addToCart, updateCart, removeFromCart } = require('../controllers/cartController');

// All cart routes require authentication
router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.put('/:id', authenticate, updateCart);
router.delete('/:id', authenticate, removeFromCart);

module.exports = router;
