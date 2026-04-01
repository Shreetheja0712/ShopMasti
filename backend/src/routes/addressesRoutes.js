const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateAddress } = require('../middleware/validate');
const { getAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addressesController');

router.get('/',     authenticate, getAddresses);
router.post('/',    authenticate, validateAddress, createAddress);
router.put('/:id',  authenticate, validateAddress, updateAddress);
router.delete('/:id', authenticate, deleteAddress);

module.exports = router;
