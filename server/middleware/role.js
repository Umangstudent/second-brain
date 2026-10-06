const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'User role not authorized' });
    }
    next();
  };
};

module.exports = requireRole;
