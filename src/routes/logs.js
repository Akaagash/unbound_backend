const express = require('express');
const { requireAdmin } = require('../middleware/auth');

function createLogsRoutes(db) {
  const router = express.Router();

  // GET /logs - Get audit logs (admin only)
  router.get('/', requireAdmin, (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.query.user_id;
    const actionType = req.query.action_type;

    let query = `
      SELECT 
        al.id,
        al.user_id,
        u.name as user_name,
        al.action_type,
        al.details,
        al.timestamp
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];

    if (userId) {
      query += ' AND al.user_id = ?';
      params.push(userId);
    }

    if (actionType) {
      query += ' AND al.action_type = ?';
      params.push(actionType);
    }

    query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(query, params, (err, logs) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch audit logs'
        });
      }

      // Parse details JSON for each log
      const parsedLogs = logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }));

      res.json({
        success: true,
        data: parsedLogs,
        pagination: {
          limit,
          offset,
          count: parsedLogs.length
        }
      });
    });
  });

  // GET /logs/stats - Get audit log statistics (admin only)
  router.get('/stats', requireAdmin, (req, res) => {
    const queries = {
      totalLogs: 'SELECT COUNT(*) as count FROM audit_logs',
      commandsExecuted: 'SELECT COUNT(*) as count FROM audit_logs WHERE action_type = "COMMAND_EXECUTED"',
      commandsRejected: 'SELECT COUNT(*) as count FROM audit_logs WHERE action_type = "COMMAND_REJECTED"',
      recentActivity: `
        SELECT 
          al.action_type,
          COUNT(*) as count
        FROM audit_logs al
        WHERE al.timestamp >= datetime('now', '-7 days')
        GROUP BY al.action_type
        ORDER BY count DESC
      `
    };

    const stats = {};

    db.get(queries.totalLogs, [], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch statistics'
        });
      }

      stats.total_logs = result.count;

      db.get(queries.commandsExecuted, [], (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
          });
        }

        stats.commands_executed = result.count;

        db.get(queries.commandsRejected, [], (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch statistics'
            });
          }

          stats.commands_rejected = result.count;

          db.all(queries.recentActivity, [], (err, results) => {
            if (err) {
              return res.status(500).json({
                success: false,
                error: 'Failed to fetch statistics'
              });
            }

            stats.recent_activity = results;

            res.json({
              success: true,
              data: stats
            });
          });
        });
      });
    });
  });

  return router;
}

module.exports = createLogsRoutes;
