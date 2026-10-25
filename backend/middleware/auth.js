const jwt = require('jsonwebtoken');

// auth() -> any logged-in user, auth('biller') -> that role (admin always allowed)
exports.auth = (...roles) => (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please log in' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired, log in again' });
  }
  if (roles.length && !roles.includes(req.user.role) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'You do not have access to this' });
  next();
};
