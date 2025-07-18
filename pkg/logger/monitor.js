/** @format */

import { systemLogger } from './utils.js';

class SystemMonitor {
  constructor() {
    this.isMonitoring = false;
    this.intervals = [];
  }

  // Bắt đầu monitor hệ thống
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    systemLogger.startup('SystemMonitor', 'N/A');

    // Monitor memory usage every 5 minutes
    const memoryInterval = setInterval(() => {
      const usage = process.memoryUsage();
      systemLogger.memory(usage);
    }, 5 * 60 * 1000);

    // Monitor CPU usage every 10 minutes
    const cpuInterval = setInterval(() => {
      const usage = process.cpuUsage();
      systemLogger.performance('CPU Usage', usage.user + usage.system, {
        userTime: usage.user,
        systemTime: usage.system,
      });
    }, 10 * 60 * 1000);

    // Monitor event loop lag every minute
    const eventLoopInterval = setInterval(() => {
      const start = process.hrtime();
      setImmediate(() => {
        const lag = process.hrtime(start);
        const lagMs = lag[0] * 1000 + lag[1] * 1e-6;
        
        if (lagMs > 100) {
          systemLogger.performance('Event Loop Lag', lagMs, {
            threshold: '100ms',
            status: lagMs > 1000 ? 'critical' : 'warning'
          });
        }
      });
    }, 60 * 1000);

    this.intervals.push(memoryInterval, cpuInterval, eventLoopInterval);

    // Monitor uncaught exceptions
    process.on('uncaughtException', (error) => {
      systemLogger.startup('CRITICAL', 'Uncaught Exception');
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Monitor unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      systemLogger.startup('CRITICAL', 'Unhandled Promise Rejection');
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Monitor process signals
    process.on('SIGTERM', () => {
      systemLogger.shutdown('Application', 'SIGTERM received');
      this.stop();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      systemLogger.shutdown('Application', 'SIGINT received');
      this.stop();
      process.exit(0);
    });
  }

  // Dừng monitor
  stop() {
    if (!this.isMonitoring) return;
    
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isMonitoring = false;
    
    systemLogger.shutdown('SystemMonitor', 'Monitoring stopped');
  }

  // Log thông tin hệ thống hiện tại
  logSystemInfo() {
    const info = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: `${Math.floor(process.uptime())}s`,
      pid: process.pid,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };

    systemLogger.startup('System Info', JSON.stringify(info));
  }

  // Monitor database connections
  monitorDatabase(mongoose) {
    mongoose.connection.on('connected', () => {
      systemLogger.startup('MongoDB', 'Connected');
    });

    mongoose.connection.on('error', (err) => {
      systemLogger.shutdown('MongoDB', `Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      systemLogger.shutdown('MongoDB', 'Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      systemLogger.startup('MongoDB', 'Reconnected');
    });
  }

  // Performance timer helper
  createPerformanceTimer(operation) {
    const start = Date.now();
    return {
      end: (metadata = {}) => {
        const duration = Date.now() - start;
        systemLogger.performance(operation, duration, metadata);
        return duration;
      }
    };
  }
}

export default new SystemMonitor();
