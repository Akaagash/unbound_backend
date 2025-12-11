const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'gateway.db');

// Generate a random API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Initialize database connection
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve(db);
      }
    });
  });
}

// Create tables
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          api_key TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
          credits INTEGER NOT NULL DEFAULT 100
        )
      `);

      // Rules table
      db.run(`
        CREATE TABLE IF NOT EXISTS rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pattern TEXT NOT NULL,
          action TEXT NOT NULL CHECK(action IN ('AUTO_ACCEPT', 'AUTO_REJECT', 'WARN', 'ALLOW'))
        )
      `);

      // Commands table
      db.run(`
        CREATE TABLE IF NOT EXISTS commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          command_text TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'rejected', 'executed')),
          output TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Audit Logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action_type TEXT NOT NULL,
          details TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log('Database tables created successfully');
          resolve(db);
        }
      });
    });
  });
}

// Seed default data
function seedDatabase(db) {
  return new Promise((resolve, reject) => {
    // Check if admin already exists
    db.get('SELECT * FROM users WHERE role = ?', ['admin'], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row) {
        console.log('Database already seeded');
        resolve(db);
        return;
      }

      const adminApiKey = generateApiKey();
      
      db.serialize(() => {
        // Insert default admin user
        db.run(
          'INSERT INTO users (name, api_key, role, credits) VALUES (?, ?, ?, ?)',
          ['Admin User', adminApiKey, 'admin', 1000],
          function(err) {
            if (err) {
              reject(err);
              return;
            }
            console.log(`\n=== DEFAULT ADMIN CREATED ===`);
            console.log(`Name: Admin User`);
            console.log(`API Key: ${adminApiKey}`);
            console.log(`Role: admin`);
            console.log(`Credits: 1000`);
            console.log(`==============================\n`);
          }
        );

        // Insert default rules
        const defaultRules = [
          // Dangerous commands - AUTO_REJECT (immediately blocked)
          { pattern: ':\\(\\)\\{\\s*:\\|:&\\s*\\};:', action: 'AUTO_REJECT' }, // fork bomb
          { pattern: 'rm\\s+-rf\\s+/', action: 'AUTO_REJECT' }, // rm -rf /
          { pattern: 'mkfs\\.', action: 'AUTO_REJECT' }, // mkfs.ext4
          { pattern: 'dd\\s+if=/dev/(zero|random)\\s+of=/dev/', action: 'AUTO_REJECT' }, // dd disk wipe
          { pattern: 'sudo\\s+rm\\s+-rf\\s+/', action: 'AUTO_REJECT' }, // sudo rm -rf
          
          // Warning commands - WARN (flagged for careful review)
          { pattern: '^sudo\\s+', action: 'WARN' }, // sudo commands
          { pattern: 'docker\\s+(rm|rmi|kill)', action: 'WARN' }, // docker delete
          { pattern: 'npm\\s+(install|uninstall)', action: 'WARN' }, // npm changes
          { pattern: 'chmod\\s+777', action: 'WARN' }, // dangerous permissions
          
          // Safe commands - ALLOW (normal approval process)
          { pattern: 'git\\s+(status|log|diff)', action: 'ALLOW' }, // git commands
          { pattern: '^(ls|cat|pwd|echo)', action: 'ALLOW' }, // basic commands
          { pattern: '^date$', action: 'ALLOW' },
          { pattern: '^whoami$', action: 'ALLOW' },
          { pattern: '^hostname$', action: 'ALLOW' }
        ];

        const stmt = db.prepare('INSERT INTO rules (pattern, action) VALUES (?, ?)');
        defaultRules.forEach(rule => {
          stmt.run(rule.pattern, rule.action);
        });
        stmt.finalize((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Default rules seeded successfully');
            resolve(db);
          }
        });
      });
    });
  });
}

// Initialize everything
async function setupDatabase() {
  try {
    const db = await initDatabase();
    await createTables(db);
    await seedDatabase(db);
    return db;
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}

module.exports = {
  setupDatabase,
  generateApiKey,
  DB_PATH
};
