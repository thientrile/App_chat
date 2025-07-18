# APP_CHAT

🚀 **Ứng dụng Chat Real-time** được xây dựng với Node.js, Express, MongoDB, Redis và Socket.IO

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Documentation](#api-documentation)
- [Scripts](#scripts)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Tổng quan

APP_CHAT là một ứng dụng chat real-time hiện đại được xây dựng với:

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (với Mongoose ODM)
- **Cache/Session**: Redis
- **Real-time**: Socket.IO
- **File Upload**: Cloudinary
- **Logging**: Winston
- **Validation**: Joi
- **Security**: Helmet, CORS

## ✨ Tính năng

- 💬 Chat real-time với Socket.IO
- 👥 Quản lý người dùng và phòng chat
- 📁 Upload và chia sẻ file (hình ảnh, video)
- 🔐 Xác thực và phân quyền
- 📊 Logging và monitoring hệ thống
- 🚀 Caching với Redis
- 📱 API RESTful đầy đủ
- 🛡️ Bảo mật tốt với Helmet và CORS

## 🏗️ Cấu trúc dự án

```
App_chat/
├── cmd/                    # Commands và entry points
│   ├── alias/             # Alias commands
│   └── server/            # Server startup
├── configs/               # Configuration files
├── global/                # Global configurations
├── internal/              # Core application logic
│   ├── controller/        # Request controllers
│   ├── model/            # Database models
│   ├── router/           # Route definitions
│   └── service/          # Business logic
├── pkg/                   # Reusable packages
│   ├── utils/            # Utility functions
│   ├── logger/           # Logging system
│   ├── mongodb/          # MongoDB connection
│   ├── redis/            # Redis connection
│   └── cloudinary/       # File upload service
└── storage/               # File storage
    ├── assets/           # Static assets
    └── logs/             # Application logs
```

## ⚙️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/thientrile/App_chat.git
cd App_chat
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cài đặt services cần thiết

Đảm bảo bạn đã cài đặt và chạy:

- **MongoDB** (local hoặc cloud)
- **Redis** (local hoặc cloud)
- **Node.js** (version 18 trở lên)

## 🔧 Cấu hình

### 1. Environment Variables

Tạo file `.env` trong thư mục root:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=APP_CHAT

# MongoDB
MONGODB_URI=mongodb://username:password@host:port/database
MONGODB_DATABASE=AppChat

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT (nếu có)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
```

### 2. Database Configuration

Cập nhật file `configs/local.js` với thông tin database của bạn:

```javascript
const development = {
  app: {
    name: "APP_CHAT",
    version: "1.0.0",
    port: 3000,
    host: "localhost",
  },
  mongodb: {
    schema: "mongodb",
    user: "your_username",
    pass: "your_password",
    host: "your_host:port",
    database: "AppChat",
    options: {
      authSource: "admin",
    },
  },
  redis: {
    user: "default",
    pass: "your_redis_password",
    host: "your_redis_host:port",
  },
  cloudinary: {
    cloud_name: "your_cloud_name",
    api_key: "your_api_key",
    api_secret: "your_api_secret",
  },
};
```

## 🚀 Chạy ứng dụng

### Development Mode

```bash
# Chạy với auto-reload (recommended cho development)
npm run dev

# Hoặc chạy với watch mode
npm run watch
```

### Production Mode

```bash
# Chạy production build
npm start
```

### Các Scripts khác

```bash
# Sync aliases
npm run alias:sync

# Watch aliases
npm run alias:watch

```bash
# Add new alias
npm run alias:add

# Development với alias watching
npm run alias:watch-dev
```

### 🌐 Chạy với Ngrok (Public Tunnel)

Ngrok cho phép bạn tạo public URL cho local server để:
- ✅ Test trên mobile devices
- ✅ Share với team members  
- ✅ Demo cho clients
- ✅ Test webhooks từ external services

---

#### **Bước 1: Chuẩn bị Ngrok**

**1.1. Cài đặt Ngrok**

```bash
# Option 1: Global install
npm install -g ngrok

# Option 2: Download binary (Windows/macOS/Linux)
# Truy cập: https://ngrok.com/download
```

**1.2. Tạo tài khoản và lấy Auth Token**

1. Đăng ký miễn phí tại: [https://ngrok.com/signup](https://ngrok.com/signup)
2. Vào Dashboard → Auth → Copy your Authtoken
3. Cấu hình token:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

---

#### **Bước 2: Chạy ứng dụng**

**2.1. Khởi động server local**

```bash
# Terminal 1: Chạy server
npm run dev
# Server sẽ chạy tại http://localhost:3000
```

**2.2. Chạy Ngrok (chọn 1 trong 3 cách)**

**🔥 Cách 1: Sử dụng script tự động (Khuyến nghị)**

```bash
# Terminal 2: Chạy script ngrok có sẵn
node cmd/ngrok/index.js
```

Script này sẽ:
- Tự động tạo tunnel
- Ghi URL vào file `.env`
- Hiển thị thông tin chi tiết

**⚡ Cách 2: Chạy ngrok trực tiếp**

```bash
# Terminal 2: Ngrok manual
ngrok http 3000
```

**🎯 Cách 3: Sử dụng config file**

```bash
# Terminal 2: Dùng config có sẵn
ngrok start sisa-backend
```

---

#### **Bước 3: Kết quả và Testing**

**3.1. Output mong đợi**

```bash
🔗 Ngrok tunnel opened at: https://abc123-def456.ngrok-free.app
✅ API_URL written to .env
📊 Ngrok dashboard: http://127.0.0.1:4040
```

**3.2. Test API endpoints**

```bash
# Health check
curl https://abc123-def456.ngrok-free.app/health-check

# Test API
curl https://abc123-def456.ngrok-free.app/api/users

# WebSocket test (nếu có frontend)
# Kết nối Socket.IO tới ngrok URL
```

---

#### **Bước 4: Cấu hình Frontend/Mobile**

**4.1. Environment Variables**

File `.env` được tự động cập nhật:

```env
# Được script tự động thêm
API_URL=https://abc123-def456.ngrok-free.app

# Sử dụng trong frontend
REACT_APP_API_URL=https://abc123-def456.ngrok-free.app
EXPO_PUBLIC_API_URL=https://abc123-def456.ngrok-free.app
```

**4.2. Frontend code example**

```javascript
// React/React Native
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Expo
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Fetch API
fetch(`${API_BASE}/api/users`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

#### **Bước 5: Monitoring & Debug**

**5.1. Ngrok Web Dashboard**

Truy cập: [http://127.0.0.1:4040](http://127.0.0.1:4040)

Xem được:
- 📊 Request/Response logs
- 📈 Traffic statistics
- 🐛 Error details
- ⏱️ Response times

**5.2. Advanced Options**

```bash
# Custom subdomain (Pro plan required)
ngrok http 3000 --subdomain=my-chat-app

# Basic authentication
ngrok http 3000 --basic-auth="username:password"

# Custom domain (Business plan)
ngrok http 3000 --hostname=api.mycompany.com

# Specific region
ngrok http 3000 --region=ap  # Asia Pacific
```

---

#### **Bước 6: Troubleshooting**

**6.1. Lỗi thường gặp**

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `tunnel not found` | Config sai hoặc token expired | `ngrok config check` → `ngrok authtoken YOUR_TOKEN` |
| `failed to start tunnel` | Port đã được sử dụng | Đổi port hoặc kill process: `lsof -ti:3000 \| xargs kill -9` |
| `too many connections` | Vượt limit free plan | Upgrade plan hoặc giảm số request |
| `CORS error` | Frontend không được phép | Thêm ngrok domain vào CORS config |

**6.2. Debugging commands**

```bash
# Kiểm tra status
ngrok --version
ngrok config check

# Restart ngrok
ngrok kill
ngrok http 3000

# Xem logs chi tiết
ngrok http 3000 --log=stdout --log-level=debug
```

**6.3. CORS Configuration**

```javascript
// Trong server code (app.js hoặc server.js)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://*.ngrok-free.app',    // Cho phép tất cả ngrok domains
    'https://*.ngrok.io'           // Legacy domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

#### **📋 Quick Reference**

```bash
# 🚀 Quick Start (All-in-one)
npm run dev                    # Terminal 1
node cmd/ngrok/index.js        # Terminal 2

# 📊 Useful URLs
http://localhost:3000          # Local server
http://127.0.0.1:4040          # Ngrok dashboard
https://dashboard.ngrok.com    # Ngrok account dashboard

# 🛠️ Useful commands
ngrok http 3000               # Basic tunnel
ngrok kill                    # Stop all tunnels
ngrok --help                  # Show help
```

## 📡 API Documentation
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```http
GET /health
```

### Endpoints chính

```http
# Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

# Chat
GET /api/chat/rooms
POST /api/chat/rooms
GET /api/chat/rooms/:id/messages
POST /api/chat/rooms/:id/messages

# User
GET /api/users/profile
PUT /api/users/profile
GET /api/users/:id

# File Upload
POST /api/upload/image
POST /api/upload/file
```

### Socket.IO Events

```javascript
// Client events
socket.emit('join_room', { roomId: 'room123' });
socket.emit('send_message', { roomId: 'room123', message: 'Hello!' });
socket.emit('typing', { roomId: 'room123', isTyping: true });

// Server events
socket.on('message_received', (data) => {});
socket.on('user_joined', (data) => {});
socket.on('user_left', (data) => {});
socket.on('typing_status', (data) => {});
```

## 📝 Scripts Chi tiết

| Script | Mô tả |
|--------|-------|
| `npm start` | Chạy server production mode |
| `npm run watch` | Chạy server với auto-reload |
| `npm run dev` | Chạy development mode với alias |
| `npm run alias:sync` | Đồng bộ module aliases |
| `npm run alias:watch` | Watch changes cho aliases |
| `npm run alias:add` | Thêm alias mới |

## 🗂️ Cấu trúc thư mục chi tiết

### `/cmd/` - Commands
- `server/server.js`: Main server entry point
- `alias/`: Module alias management

### `/internal/` - Core Logic
- `controller/`: Request handlers
- `model/`: Database models (Mongoose)
- `router/`: Express routes
- `service/`: Business logic layer
- `initializes/`: App initialization modules

### `/pkg/` - Packages
- `utils/`: Utility functions ([Xem README](./pkg/utils/README.md))
- `logger/`: Logging system với Winston
- `mongodb/`: Database connection và utilities
- `redis/`: Cache và session management
- `cloudinary/`: File upload service

### `/storage/` - Storage
- `assets/`: Static files
- `logs/`: Application logs (auto-rotation)

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. Connection refused (MongoDB)
```bash
# Kiểm tra MongoDB đang chạy
sudo systemctl status mongod

# Hoặc với Docker
docker ps | grep mongo
```

#### 2. Redis connection error
```bash
# Kiểm tra Redis
redis-cli ping

# Với Docker
docker ps | grep redis
```

#### 3. Port already in use
```bash
# Tìm process đang sử dụng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 4. Module not found
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Logs và Debugging

#### Xem logs
```bash
# Logs theo ngày
tail -f storage/logs/$(date +%Y-%m-%d-%H)/application-$(date +%Y-%m-%d-%H).info.log

# Error logs
tail -f storage/logs/$(date +%Y-%m-%d-%H)/application-$(date +%Y-%m-%d-%H).error.log
```

#### Debug mode
```bash
# Chạy với debug
DEBUG=* npm run dev

# Hoặc chỉ app logs
DEBUG=app:* npm run dev
```

## 🔒 Security

### Các biện pháp bảo mật đã implement:

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Joi validation
- **Error Handling**: Secure error responses
- **File Upload**: Cloudinary secure upload

### Best Practices:

1. **Environment Variables**: Không commit sensitive data
2. **Input Sanitization**: Validate tất cả input
3. **Authentication**: Sử dụng JWT tokens
4. **HTTPS**: Sử dụng HTTPS trong production
5. **Database**: Sử dụng MongoDB Atlas với encryption

## 🚀 Deployment

### Railway Deployment

Dự án đã được cấu hình để deploy trên Railway với file `railway.json`.

#### 1. Chuẩn bị Deploy

```bash
# Đảm bảo tất cả dependencies được cài đặt
npm install

# Test local trước khi deploy
npm start
```

#### 2. Environment Variables trên Railway

Trong Railway Dashboard, thêm các environment variables:

```env
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=your_production_mongodb_uri
MONGODB_DATABASE=AppChat

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. Troubleshooting Railway Deployment

**Service Unavailable Error:**

1. **Kiểm tra Health Check**
   ```javascript
   // Đảm bảo endpoint /health-check tồn tại
   app.get('/health-check', (req, res) => {
     res.status(200).json({ 
       status: 'OK', 
       timestamp: new Date().toISOString(),
       service: 'APP_CHAT'
     });
   });
   ```

2. **Kiểm tra Port Configuration**
   ```javascript
   // Server phải listen trên PORT từ environment
   const port = process.env.PORT || 3000;
   ```

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check Redis connection
   - Ensure network access

4. **Build Issues**
   ```bash
   # Local test
   npm run start
   
   # Check logs
   railway logs
   ```

#### 4. Railway Configuration Tối ưu

Cập nhật `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health-check",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

#### 5. Monitoring và Logs

```bash
# Xem logs real-time
railway logs --follow

# Xem logs deploy
railway logs --deployment

# Kiểm tra service status
railway status
```

### Alternative Deployment Options

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login và create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow

1. **Fork** repository
2. **Create** feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Create** Pull Request

### Code Style

- Sử dụng **ES6+ modules**
- **JSDoc** comments cho functions
- **Consistent naming**: camelCase cho variables, PascalCase cho classes
- **Error handling**: Proper try-catch và error responses

### Testing

```bash
# Chạy tests (khi có)
npm test

# Coverage
npm run test:coverage
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/thientrile/App_chat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/thientrile/App_chat/discussions)
- **Email**: your-email@domain.com

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

**Happy Coding! 🎉**
