const express = require('express');

function createAuthRoutes(db) {
  const router = express.Router();

  // GET /auth/me - Get current user details
  router.get('/me', (req, res) => {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        credits: req.user.credits
      }
    });
  });

  return router;
}

module.exports = createAuthRoutes;
