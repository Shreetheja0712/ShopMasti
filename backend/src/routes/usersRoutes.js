const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMe, updateMe, updatePassword } = require('../controllers/usersController');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.put('/me/password', authenticate, updatePassword);

module.exports = router;
