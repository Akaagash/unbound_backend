const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { generateApiKey } = require('../database');

function createUsersRoutes(db) {
  const router = express.Router();

  // GET /users - Get all users
  router.get('/', requireAdmin, (req, res) => {
    db.all(
      'SELECT id, name, role, credits FROM users ORDER BY id ASC',
      [],
      (err, users) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
          });
        }

        res.json({
          success: true,
          data: users
        });
      }
    );
  });

  // GET /users/:id - Get a specific user
  router.get('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    db.get(
      'SELECT id, name, role, credits FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
          });
        }

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        res.json({
          success: true,
          data: user
        });
      }
    );
  });

  // POST /users - Create a new user
  router.post('/', requireAdmin, (req, res) => {
    const { name, role, credits } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        error: 'name and role are required'
      });
    }

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'role must be either admin or member'
      });
    }

    const userCredits = credits !== undefined ? credits : 100;

    if (typeof userCredits !== 'number' || userCredits < 0) {
      return res.status(400).json({
        success: false,
        error: 'credits must be a non-negative number'
      });
    }

    // Generate a new API key
    const apiKey = generateApiKey();

    db.run(
      'INSERT INTO users (name, api_key, role, credits) VALUES (?, ?, ?, ?)',
      [name, apiKey, role, userCredits],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to create user'
          });
        }

        // Log the action
        db.run(
          'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
          [req.user.id, 'USER_CREATED', JSON.stringify({
            new_user_id: this.lastID,
            name,
            role,
            credits: userCredits
          })]
        );

        res.status(201).json({
          success: true,
          message: 'User created successfully. Save the API key - it will not be shown again!',
          data: {
            id: this.lastID,
            name,
            role,
            credits: userCredits,
            api_key: apiKey
          }
        });
      }
    );
  });

  // PUT /users/:id - Update a user
  router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, role, credits } = req.body;

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (role !== undefined) {
      if (!['admin', 'member'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'role must be either admin or member'
        });
      }
      updates.push('role = ?');
      values.push(role);
    }

    if (credits !== undefined) {
      if (typeof credits !== 'number' || credits < 0) {
        return res.status(400).json({
          success: false,
          error: 'credits must be a non-negative number'
        });
      }
      updates.push('credits = ?');
      values.push(credits);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (name, role, credits) must be provided'
      });
    }

    values.push(id);

    db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to update user'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        // Log the action
        db.run(
          'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
          [req.user.id, 'USER_UPDATED', JSON.stringify({
            updated_user_id: id,
            changes: { name, role, credits }
          })]
        );

        // Fetch updated user
        db.get(
          'SELECT id, name, role, credits FROM users WHERE id = ?',
          [id],
          (err, user) => {
            if (err) {
              return res.status(500).json({
                success: false,
                error: 'User updated but failed to fetch updated data'
              });
            }

            res.json({
              success: true,
              message: 'User updated successfully',
              data: user
            });
          }
        );
      }
    );
  });

  // DELETE /users/:id - Delete a user
  router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // First get the user details for audit log
    db.get(
      'SELECT id, name, role FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
          });
        }

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to delete user'
            });
          }

          // Log the action
          db.run(
            'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
            [req.user.id, 'USER_DELETED', JSON.stringify({
              deleted_user_id: id,
              name: user.name,
              role: user.role
            })]
          );

          res.json({
            success: true,
            message: 'User deleted successfully'
          });
        });
      }
    );
  });

  // POST /users/:id/regenerate-key - Regenerate API key for a user
  router.post('/:id/regenerate-key', requireAdmin, (req, res) => {
    const { id } = req.params;

    // Prevent regenerating your own key
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot regenerate your own API key'
      });
    }

    const newApiKey = generateApiKey();

    db.run(
      'UPDATE users SET api_key = ? WHERE id = ?',
      [newApiKey, id],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to regenerate API key'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        // Log the action
        db.run(
          'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
          [req.user.id, 'API_KEY_REGENERATED', JSON.stringify({
            target_user_id: id
          })]
        );

        res.json({
          success: true,
          message: 'API key regenerated successfully. Save it - it will not be shown again!',
          data: {
            api_key: newApiKey
          }
        });
      }
    );
  });

  return router;
}

module.exports = createUsersRoutes;
