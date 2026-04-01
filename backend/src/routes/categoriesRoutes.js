const express = require('express');
const router = express.Router();
const { getUpperCategories } = require('../controllers/categoriesController');

// GET /api/upper-categories
router.get('/', getUpperCategories);

module.exports = router;
