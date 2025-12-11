const express = require('express');

function createCommandsRoutes(db) {
  const router = express.Router();

  // Helper function to create audit log
  function createAuditLog(userId, actionType, details) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
        [userId, actionType, JSON.stringify(details)],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  // Helper function to match command against rules
  function matchRule(commandText) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM rules ORDER BY id ASC', [], (err, rules) => {
        if (err) {
          reject(err);
          return;
        }

        // First match wins
        for (const rule of rules) {
          try {
            const regex = new RegExp(rule.pattern);
            if (regex.test(commandText)) {
              resolve({ matched: true, rule });
              return;
            }
          } catch (error) {
            // Invalid regex in database, skip it
            console.error(`Invalid regex pattern in rule ${rule.id}:`, error);
            continue;
          }
        }

        resolve({ matched: false, rule: null });
      });
    });
  }

  // Helper function to mock command execution
  function mockExecuteCommand(commandText) {
    const outputs = {
      'ls': 'file1.txt\nfile2.txt\nfolder1/\nfolder2/',
      'pwd': '/home/user/workspace',
      'date': new Date().toString(),
      'whoami': 'user',
      'echo': commandText.replace('echo ', ''),
      'git status': 'On branch main\nYour branch is up to date.',
      'git log': 'commit abc123\nAuthor: User\nDate: Today\n\n    Initial commit',
      'git diff': 'No changes detected'
    };

    // Check for exact matches or partial matches
    for (const [key, value] of Object.entries(outputs)) {
      if (commandText.includes(key)) {
        return value;
      }
    }

    // Default mock output
    return `[MOCK] Successfully executed: ${commandText}\nOutput: Command completed successfully`;
  }

  // POST /commands/submit - Submit a command for execution
  router.post('/submit', async (req, res) => {
    const { command_text } = req.body;
    const userId = req.user.id;

    if (!command_text || command_text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'command_text is required'
      });
    }

    try {
      // Check if user has credits
      if (req.user.credits <= 0) {
        await createAuditLog(userId, 'COMMAND_REJECTED', {
          command: command_text,
          reason: 'Insufficient credits'
        });

        return res.status(403).json({
          success: false,
          error: 'Insufficient credits. Please contact admin to add more credits.',
          credits: 0
        });
      }

      // Match command against rules
      const { matched, rule } = await matchRule(command_text);

      // Rule Engine: Check for dangerous patterns
      if (matched && rule.action === 'AUTO_REJECT') {
        // Dangerous pattern detected - auto reject immediately
        await createAuditLog(userId, 'COMMAND_REJECTED', {
          command: command_text,
          reason: `Matched forbidden rule: ${rule.pattern}`,
          action: 'AUTO_REJECT'
        });

        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO commands (user_id, command_text, status, output) VALUES (?, ?, ?, ?)',
            [userId, command_text, 'rejected', `Rejected by security rule: ${rule.pattern}`],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        return res.status(403).json({
          success: false,
          error: 'Command blocked by security rule',
          status: 'rejected',
          reason: `Forbidden pattern: ${rule.pattern}`,
          credits: req.user.credits
        });
      }

      // ALL other commands go to PENDING for admin approval
      // This includes:
      // - Commands that match WARN rules
      // - Commands that match ALLOW rules
      // - Commands with no matching rules
      
      const commandId = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO commands (user_id, command_text, status, output) VALUES (?, ?, ?, ?)',
          [userId, command_text, 'pending', matched && rule.action === 'WARN' 
            ? `⚠️ Flagged for review: ${rule.pattern}` 
            : 'Awaiting admin approval'],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      await createAuditLog(userId, 'COMMAND_SUBMITTED', {
        command: command_text,
        command_id: commandId,
        matched_rule: matched ? rule.pattern : 'none',
        rule_action: matched ? rule.action : 'none',
        flagged: matched && rule.action === 'WARN'
      });

      return res.json({
        success: true,
        message: 'Command submitted and awaiting admin approval',
        data: {
          command_id: commandId,
          status: 'pending',
          flagged: matched && rule.action === 'WARN',
          credits_remaining: req.user.credits
        }
      });

    } catch (error) {
      console.error('Command submission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process command'
      });
    }
  });

  // GET /commands/history - Get command history for current user
  router.get('/history', (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    db.all(
      `SELECT id, command_text, status, output, timestamp 
       FROM commands 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
      (err, commands) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch command history'
          });
        }

        res.json({
          success: true,
          data: commands,
          pagination: {
            limit,
            offset,
            count: commands.length
          }
        });
      }
    );
  });

  // GET /commands/all - Get all commands (admin only)
  router.get('/all', (req, res) => {
    // This route should only be accessible by admins
    // The requireAdmin middleware should be added in server.js
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status; // optional filter

    let query = `
      SELECT c.id, c.command_text, c.status, c.output, c.timestamp,
             u.name as user_name, u.id as user_id
      FROM commands c
      JOIN users u ON c.user_id = u.id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(query, params, (err, commands) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch commands'
        });
      }

      res.json({
        success: true,
        data: commands,
        pagination: {
          limit,
          offset,
          count: commands.length
        }
      });
    });
  });

  // PUT /commands/:id/approve - Approve a pending command (admin only)
  router.put('/:id/approve', async (req, res) => {
    const commandId = req.params.id;
    const adminId = req.user.id;

    try {
      // Get command details
      const command = await new Promise((resolve, reject) => {
        db.get(
          'SELECT c.*, u.credits FROM commands c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
          [commandId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!command) {
        return res.status(404).json({
          success: false,
          error: 'Command not found'
        });
      }

      if (command.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: `Command is already ${command.status}`
        });
      }

      if (command.credits <= 0) {
        return res.status(400).json({
          success: false,
          error: 'User has insufficient credits'
        });
      }

      // Execute command in transaction
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          const output = mockExecuteCommand(command.command_text);

          // Update command status
          db.run(
            'UPDATE commands SET status = ?, output = ? WHERE id = ?',
            ['executed', output, commandId],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              // Deduct credits
              db.run(
                'UPDATE users SET credits = credits - 1 WHERE id = ?',
                [command.user_id],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  // Create audit log
                  db.run(
                    'INSERT INTO audit_logs (user_id, action_type, details) VALUES (?, ?, ?)',
                    [adminId, 'COMMAND_APPROVED', JSON.stringify({
                      command_id: commandId,
                      command: command.command_text,
                      user_id: command.user_id,
                      credits_deducted: 1
                    })],
                    function(err) {
                      if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      }

                      db.run('COMMIT', (err) => {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(err);
                        } else {
                          resolve({ output });
                        }
                      });
                    }
                  );
                }
              );
            }
          );
        });
      }).then(result => {
        res.json({
          success: true,
          message: 'Command approved and executed',
          data: {
            command_id: commandId,
            status: 'executed',
            output: result.output
          }
        });
      }).catch(err => {
        throw err;
      });

    } catch (error) {
      console.error('Command approval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve command'
      });
    }
  });

  // PUT /commands/:id/reject - Reject a pending command (admin only)
  router.put('/:id/reject', async (req, res) => {
    const commandId = req.params.id;
    const adminId = req.user.id;
    const { reason } = req.body;

    try {
      // Get command details
      const command = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM commands WHERE id = ?',
          [commandId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!command) {
        return res.status(404).json({
          success: false,
          error: 'Command not found'
        });
      }

      if (command.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: `Command is already ${command.status}`
        });
      }

      // Update command to rejected
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE commands SET status = ?, output = ? WHERE id = ?',
          ['rejected', reason || 'Rejected by admin', commandId],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Create audit log
      await createAuditLog(adminId, 'COMMAND_REJECTED', {
        command_id: commandId,
        command: command.command_text,
        user_id: command.user_id,
        reason: reason || 'Rejected by admin'
      });

      res.json({
        success: true,
        message: 'Command rejected',
        data: {
          command_id: commandId,
          status: 'rejected'
        }
      });

    } catch (error) {
      console.error('Command rejection error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject command'
      });
    }
  });

  return router;
}

module.exports = createCommandsRoutes;
