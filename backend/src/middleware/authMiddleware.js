const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ error: 'Not authorized, no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.jti) {
      const revoked = await db.query('SELECT jti FROM revoked_tokens WHERE jti = $1', [decoded.jti]);
      if (revoked.rows.length > 0) {
        return res.status(401).json({ error: 'TOKEN_REVOKED' });
      }
    }

    req.user = { id: decoded.id, jti: decoded.jti };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'TOKEN_EXPIRED_OR_INVALID' });
  }
};

module.exports = { protect };
