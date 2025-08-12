import app from './app.js';
import {connectDB} from './config/db.js';
import {createDatabaseIndexes} from './utils/dbIndexes.js';
import {monitorDatabaseConnection} from './utils/dbOptimization.js';
import logger from './utils/logger.js';
import config from './config/config.js';

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB');

    await createDatabaseIndexes();
    logger.info('Database indexes created');

    monitorDatabaseConnection();

    app.listen(config.port, () => {
      logger.info(`Server running on http://${config.host}:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
