// Authentication middleware to verify API key
function authenticate(db) {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required. Please provide x-api-key header.'
      });
    }

    db.get(
      'SELECT id, name, api_key, role, credits FROM users WHERE api_key = ?',
      [apiKey],
      (err, user) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Database error during authentication'
          });
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid API key'
          });
        }

        // Attach user to request object
        req.user = user;
        next();
      }
    );
  };
}

// Authorization middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin
};
