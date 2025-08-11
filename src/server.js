// server.js
import cluster from 'cluster';
import os from 'os';
import app from './app.js';
import { connectDB } from '../config/db.js';
import { createDatabaseIndexes } from './utils/dbIndexes.js';
import { monitorDatabaseConnection } from './utils/dbOptimization.js';
import logger from './utils/logger.js';
import config from '../config/config.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });

} else {
  // Worker process
  const startServer = async () => {
    try {
      // Connect to database
      await connectDB();
      logger.info('Connected to MongoDB');

      // Create database indexes
      await createDatabaseIndexes();
      logger.info('Database indexes created');

      // Monitor database connection
      monitorDatabaseConnection();

      // Start server
      const server = app.listen(config.port, config.host, () => {
        logger.info(`Worker ${process.pid} started`);
        logger.info(`Server running on http://${config.host}:${config.port} in ${config.env} mode`);
      });

      // Handle server errors
      server.on('error', (error) => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

        switch (error.code) {
          case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
          default:
            throw error;
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT received, shutting down gracefully');
        server.close(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}
