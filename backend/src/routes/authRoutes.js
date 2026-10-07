const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
