const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [full_name, email, password_hash]
    );
    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const jti = crypto.randomUUID();
    const token = jwt.sign(
      { id: user.id, jti },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ message: 'Login successful', token, user: { id: user.id, full_name: user.full_name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user && req.user.jti) {
      await db.query('INSERT INTO revoked_tokens (jti) VALUES ($1) ON CONFLICT DO NOTHING', [req.user.jti]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during logout' });
  }
};

module.exports = { register, login, logout };
