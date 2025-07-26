/**
 * Main Server Implementation
 * 
 * Loader is registered via --import flag in package.json scripts
 */
import 'dotenv/config'; // ← ES module

import { httpServer } from '../../internal/initializes/index.js';
import { Config, Logger } from '../../global.js';
import { systemLogger } from '../../pkg/logger/index.js';
const port = Config.app.port || 3000;

const server = httpServer.listen(port, () => {
  // Log server startup with detailed information
  systemLogger.startup('Express Server', port);
  
  Logger.info(`🚀 Server started successfully`, ['SERVER', null, {
    port: port,
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${port}`,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    pid: process.pid
  }]);
  
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  Logger.info('🛑 Received SIGINT, shutting down gracefully', ['SERVER']);
  systemLogger.shutdown('Express Server', 'SIGINT received');
  
  server.close(() => {
    Logger.info('✅ Server closed successfully', ['SERVER']);
    console.log('✅ Exit Server Express');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  Logger.info('🛑 Received SIGTERM, shutting down gracefully', ['SERVER']);
  systemLogger.shutdown('Express Server', 'SIGTERM received');
  
  server.close(() => {
    Logger.info('✅ Server closed successfully', ['SERVER']);
    console.log('✅ Exit Server Express');
    process.exit(0);
  });
});
