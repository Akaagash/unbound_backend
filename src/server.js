const express = require('express');
const cors = require('cors');
const { setupDatabase } = require('./database');
const { authenticate, requireAdmin } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route creators
const createAuthRoutes = require('./routes/auth');
const createCommandsRoutes = require('./routes/commands');
const createRulesRoutes = require('./routes/rules');
const createUsersRoutes = require('./routes/users');
const createLogsRoutes = require('./routes/logs');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    const db = await setupDatabase();
    console.log('Database initialized successfully\n');

    // Create Express app
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Health check route (no auth required)
    app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Command Gateway API is running',
        timestamp: new Date().toISOString()
      });
    });

    // Root route
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to Command Gateway API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /health',
          auth: 'GET /auth/me',
          commands: {
            submit: 'POST /commands/submit',
            history: 'GET /commands/history'
          },
          rules: {
            list: 'GET /rules',
            create: 'POST /rules',
            get: 'GET /rules/:id',
            update: 'PUT /rules/:id',
            delete: 'DELETE /rules/:id'
          },
          users: {
            list: 'GET /users',
            create: 'POST /users',
            get: 'GET /users/:id',
            update: 'PUT /users/:id',
            delete: 'DELETE /users/:id',
            regenerateKey: 'POST /users/:id/regenerate-key'
          },
          logs: {
            list: 'GET /logs',
            stats: 'GET /logs/stats'
          }
        }
      });
    });

    // Apply authentication middleware to all routes except health and root
    app.use('/auth', authenticate(db));
    app.use('/commands', authenticate(db));
    app.use('/rules', authenticate(db));
    app.use('/users', authenticate(db));
    app.use('/logs', authenticate(db));

    // Register routes
    app.use('/auth', createAuthRoutes(db));
    
    // Commands routes
    const commandsRouter = createCommandsRoutes(db);
    app.use('/commands', commandsRouter);
    
    // Admin-only command routes
    const adminCommandsRouter = express.Router();
    adminCommandsRouter.use(requireAdmin);
    adminCommandsRouter.get('/all', (req, res, next) => {
      // Forward to the commands router's /all handler
      req.url = '/all';
      commandsRouter.handle(req, res, next);
    });
    adminCommandsRouter.put('/:id/approve', (req, res, next) => {
      req.url = `/${req.params.id}/approve`;
      commandsRouter.handle(req, res, next);
    });
    adminCommandsRouter.put('/:id/reject', (req, res, next) => {
      req.url = `/${req.params.id}/reject`;
      commandsRouter.handle(req, res, next);
    });
    app.use('/commands', adminCommandsRouter);
    
    app.use('/rules', createRulesRoutes(db));
    app.use('/users', createUsersRoutes(db));
    app.use('/logs', createLogsRoutes(db));

    // Error handling middleware (must be last)
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Command Gateway API server is running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`\n💡 Test the API:`);
      console.log(`   curl http://localhost:${PORT}/health`);
      console.log(`\n📖 Check your console for the default admin API key\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
