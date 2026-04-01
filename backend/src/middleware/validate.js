/**
 * validate.js
 * Lightweight request-body validation middleware factory.
 * Usage: router.post('/login', validate(['email','password']), handler)
 *
 * Also exports specific validators for common payloads.
 */

/**
 * validate(fields)
 * Returns middleware that checks the listed fields are present & non-empty in req.body.
 */
const validate = (fields) => (req, res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
  );
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }
  next();
};

/** Validate register body */
const validateRegister = validate(['username', 'email', 'password']);

/** Validate login body */
const validateLogin = validate(['email', 'password']);

/** Validate order creation body */
const validateOrder = (req, res, next) => {
  const { address_id, items } = req.body;
  if (!address_id) return res.status(400).json({ error: 'address_id is required.' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'items must be a non-empty array.' });
  for (const item of items) {
    if (!item.variant_id || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ error: 'Each item needs variant_id and quantity >= 1.' });
    }
  }
  next();
};

/** Validate address body */
const validateAddress = validate(['full_name', 'mobile_number', 'city', 'state', 'pincode']);

module.exports = { validate, validateRegister, validateLogin, validateOrder, validateAddress };
