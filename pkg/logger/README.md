# Logger System Documentation

Hệ thống logging toàn diện cho ứng dụng Node.js với Winston, hỗ trợ nhiều loại log khác nhau và system monitoring.

## 📁 Cấu trúc thư mục

```
pkg/logger/
├── index.js                    # Entry point, export tất cả
├── myLogger.js                 # Main Logger class (Winston wrapper)
├── utils.js                   # Specialized loggers & middleware
├── monitor.js                 # System monitoring
├── examples.js                # Ví dụ sử dụng
├── userActivityExamples.js    # Ví dụ user activity logging
├── userActivityMiddleware.js  # Middleware theo dõi hoạt động user
└── UserActivity/
    ├── UserActivity.model.js      # MongoDB model
    └── UserActivityService.js     # Service layer
```

## 🚀 Import và Setup

### Import cơ bản
```javascript
import { 
  MyLogger,           // Main logger class
  systemLogger,       // System events
  requestLogger,      // HTTP requests  
  errorLogger,        // Error handling
  dbLogger,          // Database operations
  authLogger,        // Authentication
  apiLogger,         // API calls
  securityLogger,    // Security events
  userActivityLogger, // User activity
  systemMonitor      // System monitoring
} from '@logger/index.js';
```

### Khởi tạo trong ứng dụng
```javascript
// Import logger vào global để sử dụng toàn cục
import { Logger } from '@global/global.js';

// Logger đã được khởi tạo sẵn trong global, ready to use
Logger.info('Application started');
```

## 📝 Các loại Logger

### 1. **System Logger** - Sự kiện hệ thống
```javascript
import { systemLogger } from '@logger/index.js';

// Server startup/shutdown
systemLogger.startup('Express Server', 3001);
systemLogger.shutdown('Express Server', 'Graceful shutdown');

// Memory monitoring  
systemLogger.memory(process.memoryUsage());

// Performance tracking
systemLogger.performance('Database Query', 150, { 
  query: 'users.find()', 
  collection: 'users' 
});
```

### 2. **Request Logger** - HTTP requests
```javascript
import { requestLogger } from '@logger/index.js';

// Middleware sử dụng
app.use(requestLogger);

// Manual logging
app.get('/api/users', (req, res) => {
  // Tự động log request khi dùng middleware
  res.json(users);
});
```

### 3. **Error Logger** - Xử lý lỗi
```javascript
import { errorLogger } from '@logger/index.js';

// Middleware error handling
app.use(errorLogger);

// Manual error logging
try {
  await dangerousOperation();
} catch (error) {
  Logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'dangerousOperation'
  });
}
```

### 4. **Database Logger** - Database operations
```javascript
import { dbLogger } from '@logger/index.js';

// Connection events
dbLogger.connection('MongoDB', 'Connected successfully');
dbLogger.connection('MongoDB', 'Connection failed', { error: err.message });

// Query logging
dbLogger.query('users.find()', 145, { 
  collection: 'users',
  filter: { status: 'active' }
});

// Transaction logging
dbLogger.transaction('user-creation', 'started', { userId: '123' });
dbLogger.transaction('user-creation', 'completed', { userId: '123' });
```

### 5. **Auth Logger** - Authentication/Authorization
```javascript
import { authLogger } from '@logger/index.js';

// Login events
authLogger.login('user123', 'success', req);
authLogger.login('user123', 'failed', req, { reason: 'Invalid password' });

// Logout
authLogger.logout('user123', req);

// Permission events
authLogger.permission('user123', 'read:users', 'granted', req);
authLogger.permission('user123', 'delete:admin', 'denied', req);
```

### 6. **API Logger** - External API calls
```javascript
import { apiLogger } from '@logger/index.js';

// API request/response
apiLogger.request('POST', 'https://api.external.com/users', { userId: '123' });
apiLogger.response('POST', 'https://api.external.com/users', 201, 250);

// API errors
apiLogger.error('GET', 'https://api.external.com/data', 500, { 
  error: 'Timeout',
  duration: 5000 
});
```

### 7. **Security Logger** - Security events
```javascript
import { securityLogger } from '@logger/index.js';

// Suspicious activities
securityLogger.suspicious('Multiple failed login attempts', req, {
  attempts: 5,
  timeframe: '5 minutes'
});

// Access violations
securityLogger.violation('Unauthorized admin access attempt', req, {
  resource: '/admin/users',
  permission: 'admin:read'
});

// Blocked activities
securityLogger.blocked('Rate limit exceeded', req, {
  limit: 100,
  window: '1 hour'
});
```

### 8. **User Activity Logger** - Hoạt động người dùng
```javascript
import { userActivityLogger } from '@logger/index.js';

// User actions
userActivityLogger.action('user123', 'profile_update', req, {
  changes: ['email', 'phone'],
  oldEmail: 'old@example.com',
  newEmail: 'new@example.com'
});

// Page visits
userActivityLogger.visit('user123', '/dashboard', req);

// Feature usage
userActivityLogger.feature('user123', 'export_data', req, {
  format: 'CSV',
  records: 1500
});
```

## 🛠️ Middleware

### 1. **Request Logging Middleware**
```javascript
import { requestLogger } from '@logger/index.js';

// Tự động log tất cả HTTP requests
app.use(requestLogger);

// Log format: [timestamp] [REQUEST] method url - ip userAgent duration
```

### 2. **Error Logging Middleware**
```javascript
import { errorLogger } from '@logger/index.js';

// Đặt cuối cùng để catch tất cả errors
app.use(errorLogger);
```

### 3. **User Activity Middleware**
```javascript
import { userActivityMiddleware, unauthorizedActivityMiddleware } from '@logger/index.js';

// Track hoạt động của user đã đăng nhập
app.use(userActivityMiddleware);

// Track hoạt động của user chưa đăng nhập
app.use(unauthorizedActivityMiddleware);
```

## 📊 System Monitoring

### Khởi động System Monitor
```javascript
import { systemMonitor } from '@logger/index.js';

// Bắt đầu monitoring
systemMonitor.start();

// Log system info
systemMonitor.logSystemInfo();

// Monitor database
systemMonitor.monitorDatabase(mongoose);

// Performance timer
const timer = systemMonitor.createPerformanceTimer('Heavy Operation');
await heavyOperation();
timer.end({ records: 1000, source: 'database' });
```

### Tính năng Monitor
- **Memory Usage**: Theo dõi memory mỗi 5 phút
- **CPU Usage**: Theo dõi CPU mỗi 10 phút  
- **Event Loop Lag**: Kiểm tra lag mỗi phút
- **Uncaught Exceptions**: Tự động log và exit
- **Unhandled Rejections**: Tự động log
- **Process Signals**: Handle SIGTERM, SIGINT
- **Database Events**: MongoDB connection monitoring

## 📁 Log Files

Logs được lưu trong `storage/logs/YYYY-MM-DD-HH/`:

```
storage/logs/
└── 2025-07-17-14/
    ├── application-2025-07-17-14.info.log     # Info logs
    ├── application-2025-07-17-14.error.log    # Error logs
    └── application-2025-07-17-14.info.log.gz  # Compressed old logs
```

### Log Rotation
- **Tự động**: Mỗi giờ tạo file mới
- **Compression**: File cũ được nén gzip
- **Max Size**: 20MB per file
- **Max Files**: 14 files (2 weeks)

## 🎯 Best Practices

### 1. **Structured Logging**
```javascript
// ✅ Good - Structured data
Logger.info('User created', {
  userId: user._id,
  email: user.email,
  role: user.role,
  registrationMethod: 'email'
});

// ❌ Bad - String concatenation  
Logger.info(`User ${user.email} created with role ${user.role}`);
```

### 2. **Error Context**
```javascript
// ✅ Good - Full context
try {
  await User.create(userData);
} catch (error) {
  Logger.error('User creation failed', {
    error: error.message,
    stack: error.stack,
    userData: { email: userData.email, role: userData.role },
    operation: 'User.create'
  });
}
```

### 3. **Performance Tracking**
```javascript
// ✅ Good - Measure important operations
const timer = systemMonitor.createPerformanceTimer('Database Migration');
await runMigration();
const duration = timer.end({ 
  migrationType: 'user-schema-v2',
  recordsProcessed: 10000 
});
```

### 4. **Security Logging**
```javascript
// ✅ Good - Log security events
if (failedAttempts > 5) {
  securityLogger.suspicious('Multiple login failures', req, {
    userId: userId,
    attempts: failedAttempts,
    timeWindow: '10 minutes'
  });
}
```

## 🔧 Configuration

### Logger Config (trong myLogger.js)
```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'storage/logs/%DATE%/application-%DATE%.info.log',
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'storage/logs/%DATE%/application-%DATE%.error.log', 
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    })
  ]
});
```

### Environment Variables
```bash
LOG_LEVEL=info          # debug, info, warn, error
NODE_ENV=development    # development, production
```

## 📈 User Activity Tracking

### Database Model
```javascript
// UserActivity.model.js
{
  userId: String,           // ID của user (null nếu chưa đăng nhập)
  action: String,          // Hành động thực hiện
  resource: String,        // Resource được truy cập
  method: String,          // HTTP method
  ip: String,             // IP address
  userAgent: String,      // Browser/app info
  sessionId: String,      // Session ID
  timestamp: Date,        // Thời gian
  metadata: Object        // Dữ liệu bổ sung
}
```

### Query Examples
```javascript
// Lấy hoạt động của user
const activities = await UserActivity.find({ userId: 'user123' })
  .sort({ timestamp: -1 })
  .limit(100);

// Thống kê hoạt động theo ngày
const stats = await UserActivity.aggregate([
  {
    $match: { 
      timestamp: { $gte: new Date('2025-07-01') } 
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
      count: { $sum: 1 },
      uniqueUsers: { $addToSet: '$userId' }
    }
  }
]);
```

## 🚨 Error Handling

### Automatic Error Capture
```javascript
// Tự động log uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    pid: process.pid
  });
  process.exit(1);
});

// Tự động log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Promise Rejection', {
    reason: reason.toString(),
    promise: promise.toString(),
    pid: process.pid
  });
});
```

## 📚 Examples

Xem file `examples.js` và `userActivityExamples.js` để có thêm ví dụ chi tiết về cách sử dụng từng loại logger.

---

## 🔗 Quick Links

- **Main Logger**: `myLogger.js` - Winston wrapper chính
- **Utilities**: `utils.js` - Specialized loggers  
- **Monitoring**: `monitor.js` - System performance tracking
- **User Activity**: `UserActivity/` - User behavior tracking
- **Examples**: `examples.js` - Usage examples
