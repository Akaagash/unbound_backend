const express = require('express');
const { requireAdmin } = require('../middleware/auth');

function createRulesRoutes(db) {
  const router = express.Router();

  // Helper function to validate regex pattern
  function isValidRegex(pattern) {
    try {
      new RegExp(pattern);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // GET /rules - Get all rules
  router.get('/', requireAdmin, (req, res) => {
    db.all('SELECT * FROM rules ORDER BY id ASC', [], (err, rules) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch rules'
        });
      }

      res.json({
        success: true,
        data: rules
      });
    });
  });

  // GET /rules/:id - Get a specific rule
  router.get('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM rules WHERE id = ?', [id], (err, rule) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch rule'
        });
      }

      if (!rule) {
        return res.status(404).json({
          success: false,
          error: 'Rule not found'
        });
      }

      res.json({
        success: true,
        data: rule
      });
    });
  });

  // POST /rules - Create a new rule
  router.post('/', requireAdmin, (req, res) => {
    const { pattern, action } = req.body;

    if (!pattern || !action) {
      return res.status(400).json({
        success: false,
        error: 'pattern and action are required'
      });
    }

    if (!['AUTO_ACCEPT', 'AUTO_REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'action must be either AUTO_ACCEPT or AUTO_REJECT'
      });
    }

    // Validate regex pattern
    const validation = isValidRegex(pattern);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Invalid regex pattern: ${validation.error}`
      });
    }

    db.run(
      'INSERT INTO rules (pattern, action) VALUES (?, ?)',
      [pattern, action],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to create rule'
          });
        }

        // Log the action
        db.run(
          'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
          [req.user.id, 'RULE_CREATED', JSON.stringify({
            rule_id: this.lastID,
            pattern,
            action
          })]
        );

        res.status(201).json({
          success: true,
          message: 'Rule created successfully',
          data: {
            id: this.lastID,
            pattern,
            action
          }
        });
      }
    );
  });

  // PUT /rules/:id - Update a rule
  router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { pattern, action } = req.body;

    if (!pattern || !action) {
      return res.status(400).json({
        success: false,
        error: 'pattern and action are required'
      });
    }

    if (!['AUTO_ACCEPT', 'AUTO_REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'action must be either AUTO_ACCEPT or AUTO_REJECT'
      });
    }

    // Validate regex pattern
    const validation = isValidRegex(pattern);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Invalid regex pattern: ${validation.error}`
      });
    }

    db.run(
      'UPDATE rules SET pattern = ?, action = ? WHERE id = ?',
      [pattern, action, id],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to update rule'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            error: 'Rule not found'
          });
        }

        // Log the action
        db.run(
          'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
          [req.user.id, 'RULE_UPDATED', JSON.stringify({
            rule_id: id,
            pattern,
            action
          })]
        );

        res.json({
          success: true,
          message: 'Rule updated successfully',
          data: {
            id: parseInt(id),
            pattern,
            action
          }
        });
      }
    );
  });

  // DELETE /rules/:id - Delete a rule
  router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    // First get the rule details for audit log
    db.get('SELECT * FROM rules WHERE id = ?', [id], (err, rule) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch rule'
        });
      }

      if (!rule) {
        return res.status(404).json({
          success: false,
          error: 'Rule not found'
        });
      }

      db.run('DELETE FROM rules WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to delete rule'
          });
        }

        // Log the action
        db.run(
          'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
          [req.user.id, 'RULE_DELETED', JSON.stringify({
            rule_id: id,
            pattern: rule.pattern,
            action: rule.action
          })]
        );

        res.json({
          success: true,
          message: 'Rule deleted successfully'
        });
      });
    });
  });

  return router;
}

module.exports = createRulesRoutes;
