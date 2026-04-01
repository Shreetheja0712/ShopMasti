const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');
const { getOrders, createOrder } = require('../controllers/ordersController');

router.get('/',  authenticate, getOrders);
router.post('/', authenticate, validateOrder, createOrder);

module.exports = router;
