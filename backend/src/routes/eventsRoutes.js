const express = require('express');
const router = express.Router();
const { getEvents, getEvent } = require('../controllers/eventsController');

// GET /api/events       — all active events
// GET /api/events/:id   — single event with subcategories + discounts
router.get('/', getEvents);
router.get('/:id', getEvent);

module.exports = router;
