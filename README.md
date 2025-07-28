# 💬 APP CHAT

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</div>

<div align="center">
  <h3>🚀 Real-time Chat Application</h3>
  <p>Modern chat application built with Node.js, Express, MongoDB, Redis, and Socket.IO</p>
</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Getting Started](#-getting-started)
- [🌐 Ngrok Setup](#-ngrok-setup)
- [📡 API Documentation](#-api-documentation)
- [🏗️ Project Structure](#️-project-structure)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)

# 💬 APP CHAT

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</div>

<div align="center">
  <h3>🚀 Enterprise-Grade Real-time Chat Application</h3>
  <p>Production-ready chat platform with advanced messaging, friendship system, and push notifications</p>
</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Getting Started](#-getting-started)
- [🌐 Ngrok Setup](#-ngrok-setup)
- [📡 API Documentation](#-api-documentation)
- [🏗️ Project Structure](#️-project-structure)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

**APP_CHAT** is a comprehensive, production-ready real-time chat application built with modern technologies and enterprise-grade architecture. The system provides a complete messaging platform with advanced features including friendship management, push notifications, file sharing, and real-time communication.

### 🌟 **Key Highlights:**

- **🔄 Real-time Communication**: Instant messaging with Socket.IO and Redis clustering
- **👥 Social Features**: Complete friendship system with requests, acceptance, and blocking
- **🔐 Enterprise Security**: JWT-based authentication with refresh tokens and role-based access
- **📱 Push Notifications**: Firebase Cloud Messaging integration for mobile alerts
- **📁 Media Sharing**: Secure file upload and sharing with multiple format support
- **🚀 High Performance**: Redis caching and connection pooling for optimal speed
- **📊 Comprehensive Logging**: Enterprise-grade logging with Winston and request tracking
- **🛡️ Production Security**: Advanced security measures with rate limiting and input validation

### 🏢 **Architecture:**

Built following **Clean Architecture** principles with clear separation of concerns:
- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and business rules
- **Infrastructure Layer**: External services and data persistence
- **Presentation Layer**: API endpoints and real-time communication

### 🎯 **Target Use Cases:**

- **Team Communication**: Internal messaging for organizations
- **Customer Support**: Real-time customer service platforms  
- **Social Applications**: Community chat and discussion platforms
- **Educational Systems**: Online learning and collaboration
- **Gaming Platforms**: In-game chat and communication

## ✨ Features

### 💬 **Core Messaging**
| Feature | Status | Description |
|---------|--------|-------------|
| **Real-time Chat** | ✅ | Instant messaging with Socket.IO and Redis clustering |
| **Message Types** | ✅ | Text, images, videos, and file attachments |
| **Chat Rooms** | ✅ | Group and private conversations |
| **Message History** | ✅ | Persistent message storage and retrieval |
| **Typing Indicators** | ✅ | Real-time typing status updates |
| **Message Status** | ✅ | Delivery and read receipts |

### 👥 **Social & User Management**
| Feature | Status | Description |
|---------|--------|-------------|
| **User Registration** | ✅ | Email/phone registration with validation |
| **Friendship System** | ✅ | Friend requests, acceptance, rejection, blocking |
| **User Profiles** | ✅ | Complete profile management with avatars |
| **User Search** | ✅ | Find and connect with other users |
| **Online Status** | ✅ | Real-time user presence tracking |

### 🔐 **Security & Authentication**
| Feature | Status | Description |
|---------|--------|-------------|
| **JWT Authentication** | ✅ | Secure token-based authentication |
| **Refresh Tokens** | ✅ | Automatic token renewal system |
| **Role-based Access** | ✅ | Admin and member permissions |
| **Rate Limiting** | ✅ | API abuse prevention |
| **Input Validation** | ✅ | Comprehensive data validation |

### 📱 **Notifications & Push**
| Feature | Status | Description |
|---------|--------|-------------|
| **Push Notifications** | ✅ | Firebase Cloud Messaging integration |
| **Real-time Alerts** | ✅ | Instant notification system |
| **Notification Types** | ✅ | Friend requests, messages, system alerts |
| **FCM Token Management** | ✅ | Device token registration and updates |

### 🛠️ **Technical Features**
| Feature | Status | Description |
|---------|--------|-------------|
| **Redis Caching** | ✅ | High-performance data caching |
| **File Upload** | ✅ | Secure media upload and storage |
| **Logging System** | ✅ | Comprehensive request and error logging |
| **Health Monitoring** | ✅ | System health checks and metrics |
| **Ngrok Integration** | ✅ | Easy public tunnel for development |

## 🛠️ Tech Stack

### 🎯 **Core Backend**
- **Runtime**: Node.js 20+ (ES Modules)
- **Framework**: Express.js 5 (Latest)
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis 5+ with clustering support
- **Real-time**: Socket.IO 4 with Redis adapter

### 🔐 **Authentication & Security**
- **JWT**: Jose library for modern JWT handling
- **Password**: bcrypt with configurable salt rounds
- **Security Headers**: Helmet.js
- **CORS**: Configurable cross-origin resource sharing
- **Validation**: Joi schemas for input validation
- **Rate Limiting**: Express-based request limiting

### 📱 **Notifications & Media**
- **Push Notifications**: Firebase Admin SDK
- **File Upload**: Multer with validation
- **Media Storage**: Configurable storage backends
- **Cloud Services**: Firebase Cloud Messaging

### 📊 **Logging & Monitoring**
- **Logging**: Winston with daily rotation
- **Request Tracking**: Morgan HTTP request logger
- **Error Handling**: Centralized error management
- **Health Checks**: Built-in system monitoring

### 🛠️ **Development & DevOps**
- **Environment**: dotenv configuration
- **Development**: Node.js --watch mode
- **Tunneling**: Ngrok integration
- **Package Manager**: npm with modern dependencies
- **Code Style**: ES6+ modules and modern JavaScript

### 🔧 **Utilities & Libraries**
- **UUID**: Modern UUID generation
- **Lodash**: Utility functions
- **Compression**: Response compression
- **Access Control**: Role-based permissions
- **Crypto**: Built-in cryptographic functions

## 📦 Installation

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or cloud)
- [Redis](https://redis.io/) (local or cloud)
- [Git](https://git-scm.com/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/thientrile/App_chat.git
cd App_chat

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Configure your environment variables (see Configuration section)

# 5. Start the application
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=APP_CHAT

# Database
MONGODB_URI=mongodb://localhost:27017/app_chat
MONGODB_DATABASE=AppChat

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
```

### Database Configuration

Update `configs/local.js` with your database credentials:

```javascript
const development = {
  app: {
    name: "APP_CHAT",
    version: "1.0.0",
    port: process.env.PORT || 3000,
    host: "localhost",
  },
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/app_chat"
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ""
  }
};
```

## 🚀 Getting Started

### Development Mode

```bash
# Start with auto-reload (recommended)
npm run dev

# Alternative: watch mode
npm run watch
```

### Production Mode

```bash
# Start production server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run watch` | Start server with file watching |
| `npm run ngrok` | Start ngrok tunnel |

## 🌐 Ngrok Setup

Expose your local server to the internet for testing on mobile devices or sharing with team members.

### Quick Setup

1. **Install Ngrok**
   ```bash
   # Global installation
   npm install -g ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Get Auth Token**
   - Sign up at [ngrok.com](https://ngrok.com/signup)
   - Copy your authtoken from the dashboard
   - Configure: `ngrok config add-authtoken YOUR_TOKEN`

3. **Start Tunnel**
   ```bash
   # Method 1: Using built-in script (recommended)
   npm run dev          # Terminal 1
   node cmd/ngrok/index.js  # Terminal 2
   
   # Method 2: Direct ngrok
   ngrok http 3000
   
   # Method 3: Using config file
   ngrok start sisa-backend
   ```

### Expected Output

```bash
🔗 Ngrok tunnel: https://abc123.ngrok-free.app
✅ API_URL written to .env
📊 Dashboard: http://127.0.0.1:4040
```

## 📡 API Documentation

### Base URL
```
Local:  http://localhost:3000
Ngrok:  https://your-subdomain.ngrok-free.app
```

### Authentication Endpoints

```http
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login  
PATCH  /api/auth/refresh-token   # Refresh JWT token
DELETE /api/auth/logout          # User logout
PATCH  /api/auth/set-fcm-token   # Set Firebase token
```

### Chat Endpoints

```http
GET    /api/chat/rooms           # Get user's chat rooms
POST   /api/chat/rooms           # Create new chat room
GET    /api/chat/rooms/:id       # Get room details
POST   /api/chat/rooms/:id/join  # Join a chat room
GET    /api/chat/rooms/:id/messages  # Get room messages
POST   /api/chat/rooms/:id/messages # Send message
```

### User Endpoints

```http
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update user profile
GET    /api/users/search         # Search users
```

### File Upload

```http
POST   /api/upload/image         # Upload image
POST   /api/upload/video         # Upload video
POST   /api/upload/document      # Upload document
```

### Health Check

```http
GET    /health-check             # Application health status
```

### Socket.IO Events

#### Client → Server
```javascript
// Join a room
socket.emit('join_room', { roomId: 'room123' });

// Send message
socket.emit('send_message', { 
  roomId: 'room123', 
  message: 'Hello!',
  type: 'text' // text, image, file
});

// Typing indicator
socket.emit('typing', { roomId: 'room123', isTyping: true });

// Leave room
socket.emit('leave_room', { roomId: 'room123' });
```

#### Server → Client
```javascript
// New message received
socket.on('message_received', (data) => {
  // { messageId, roomId, senderId, content, timestamp }
});

// User joined room
socket.on('user_joined', (data) => {
  // { userId, username, roomId }
});

// User left room
socket.on('user_left', (data) => {
  // { userId, roomId }
});

// Typing status
socket.on('typing_status', (data) => {
  // { userId, roomId, isTyping }
});
```

## 🏗️ Project Structure

```
📁 App_chat/
├── 📁 cmd/                     # Application commands
│   ├── 📁 ngrok/              # Ngrok tunnel utilities
│   └── 📁 server/             # Server startup
├── 📁 configs/                # Configuration files
├── 📁 global/                 # Global configurations
├── 📁 internal/               # Core application logic
│   ├── 📁 controller/         # HTTP request handlers
│   ├── 📁 model/             # Database models (Mongoose)
│   ├── 📁 repository/        # Data access layer
│   ├── 📁 router/            # Express route definitions
│   ├── 📁 service/           # Business logic layer
│   ├── 📁 validation/        # Input validation schemas
│   └── 📁 initializes/       # App initialization modules
├── 📁 pkg/                   # Reusable packages
│   ├── 📁 async/             # Async utilities
│   ├── 📁 cloudinary/        # File upload service
│   ├── 📁 logger/            # Logging system
│   ├── 📁 mongodb/           # Database connection
│   ├── 📁 redis/             # Cache utilities
│   ├── 📁 response/          # Response formatters
│   ├── 📁 token/             # JWT authentication
│   ├── 📁 utils/             # General utilities
│   └── 📁 validation/        # Validation middleware
├── 📁 storage/               # File storage
│   ├── 📁 assets/            # Static assets
│   └── 📁 logs/              # Application logs
├── 📁 test/                  # Test files
├── 📄 package.json           # Dependencies and scripts
├── 📄 ngrok.yml              # Ngrok configuration
└── 📄 railway.json           # Railway deployment config
```

### Key Directories

- **`/internal/`**: Core business logic following clean architecture
- **`/pkg/`**: Reusable packages and utilities
- **`/storage/`**: File storage and logs
- **`/configs/`**: Environment-specific configurations

## 🔒 Security

### Implemented Security Measures

| Security Feature | Implementation | Status |
|------------------|----------------|--------|
| **Authentication** | JWT with refresh tokens | ✅ |
| **Password Hashing** | bcrypt with salt rounds | ✅ |
| **CORS** | Configurable origins | ✅ |
| **Helmet** | Security headers | ✅ |
| **Input Validation** | Joi schemas | ✅ |
| **Rate Limiting** | Express middleware | ✅ |
| **Error Handling** | Custom error responses | ✅ |
| **File Upload** | Cloudinary secure upload | ✅ |

### Security Best Practices

```javascript
// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://*.ngrok-free.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🚀 Deployment

### Railway (Recommended)

1. **Prepare for deployment**
   ```bash
   npm install
   npm start  # Test locally
   ```

2. **Environment Variables on Railway**
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_production_mongodb_uri
   REDIS_HOST=your_redis_host
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   # ... other env vars
   ```

3. **Railway Configuration** (`railway.json`)
   ```json
   {
     "build": { "builder": "NIXPACKS" },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/health-check",
       "healthcheckTimeout": 300
     }
   }
   ```

### Alternative Deployments

<details>
<summary>Heroku Deployment</summary>

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```
</details>

<details>
<summary>Docker Deployment</summary>

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```
</details>

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "auth"
```

### Test Structure

```
📁 test/
├── 📁 unit/           # Unit tests
├── 📁 integration/    # Integration tests
├── 📁 e2e/           # End-to-end tests
└── 📁 fixtures/      # Test data
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork
   ```bash
   git clone https://github.com/your-username/App_chat.git
   ```
3. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make** your changes
5. **Test** your changes
   ```bash
   npm test
   npm run dev  # Manual testing
   ```
6. **Commit** your changes
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
7. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create** a Pull Request

### Code Style Guidelines

- Use **ES6+ modules** and modern JavaScript
- Follow **camelCase** for variables, **PascalCase** for classes
- Add **JSDoc** comments for functions
- Include **error handling** with try-catch blocks
- Write **meaningful commit messages**

### Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: auth, chat, api, db, etc.

Examples:
feat(auth): add refresh token mechanism
fix(chat): resolve message duplication issue
docs(readme): update installation guide
```

## 📞 Support & Community

- **🐛 Issues**: [GitHub Issues](https://github.com/thientrile/App_chat/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/thientrile/App_chat/discussions)
- **📧 Email**: your-email@domain.com
- **📚 Wiki**: [Project Wiki](https://github.com/thientrile/App_chat/wiki)

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🎉 Happy Coding!</h3>
  <p>Made with ❤️ by <a href="https://github.com/thientrile">thientrile</a></p>
  
  <a href="#-app-chat">⬆️ Back to Top</a>
</div>
