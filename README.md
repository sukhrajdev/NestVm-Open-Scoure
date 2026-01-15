# NestVM - Open Source Uptime Monitoring

An open-source uptime monitoring solution inspired by Uptime Robot. Built with Node.js, Express, and PostgreSQL, NestVM allows users to monitor website availability and receive real-time status updates.

## 🚀 Features

### Authentication & Authorization
- **User Registration** with email verification
- **Secure Login** with JWT-based access and refresh tokens
- **Email Verification** system with token-based verification
- **Password Reset** functionality
- **Role-Based Access Control** (USER, ADMIN)
- **Rate Limiting** on authentication endpoints

### User Management
- **User Profile Management** - Get, update, and delete user accounts
- **Admin Dashboard** - View all users (admin only)
- **Role Management** - Assign user roles (admin only)
- **Account Security** - Password hashing with bcrypt, secure token handling

### Monitor Management
- **Create Monitors** - Track website uptime with custom intervals
- **Monitor Limits** - Max 5 monitors per user (configurable)
- **Real-time Status** - UP/DOWN status tracking
- **Update Monitors** - Modify monitoring configuration
- **Delete Monitors** - Remove monitors and update user quota
- **Monitor History** - Track last check timestamp

### Uptime Monitoring
- **Automated Health Checks** - Cron-based monitoring every 30 seconds
- **HTTP Status Detection** - Categorizes responses (UP for 2xx-3xx, DOWN otherwise)
- **Error Handling** - Timeout and network error detection
- **Interval-Based Checking** - Respects monitor-specific check intervals

## 📋 API Endpoints

### Authentication Routes (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| GET | `/refresh-token` | Refresh access token |
| GET | `/verify-email/:authToken` | Verify email address |
| POST | `/resend-verification-email` | Resend verification email |

### User Routes (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |
| GET | `/` | Get all users (admin only) |
| PUT | `/me` | Update user profile |
| DELETE | `/me` | Delete user account |
| PUT | `/:id/role` | Update user role (admin only) |
| POST | `/forget-password` | Change password |

### Monitor Routes (`/api/v1/monitors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new monitor |
| GET | `/` | Get all user monitors |
| GET | `/:monitorId` | Get specific monitor |
| PUT | `/:monitorId` | Update monitor |
| DELETE | `/:monitorId` | Delete monitor |

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer (Gmail SMTP)
- **Scheduling**: node-cron
- **Rate Limiting**: express-rate-limit
- **Cookie Management**: cookie-parser

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Gmail account (for email verification)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/sukhrajdev/NestVm-Open-Scoure.git
cd NestVm-Open-Scoure
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp src/.env.sample src/.env
```

4. **Configure `.env` file**
```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nestvmdb

# JWT Tokens
AUTH_TOKEN_SECRET=your_auth_secret_key
AUTH_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_key
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_USER=your-email@gmail.com
FRONTEND_URL=http://localhost:3000

# Optional
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRES_IN=1d
```

5. **Set up database**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. **Start the server**
```bash
npm start
```

Server runs on `http://localhost:3000`

## 🔐 Security Features

- **JWT Authentication** with separate access and refresh tokens
- **HTTPOnly Cookies** for token storage
- **Rate Limiting** on sensitive endpoints:
  - Registration: 5 requests/hour
  - Login: 10 requests/15 minutes
  - Email verification: 50 requests/15 minutes
  - Resend email: 3 requests/hour
  - Token refresh: 30 requests/15 minutes
- **Password Hashing** with bcryptjs (10 salt rounds)
- **Email Verification** requirement before account activation
- **Role-Based Access Control** for admin endpoints

## 📊 Database Schema

### User Model
```prisma
- id: Int (primary key)
- username: String
- email: String (unique)
- password: String (hashed)
- isVerified: Boolean (default: false)
- role: Role (USER | ADMIN)
- monitorCount: Int (default: 0)
- maxMonitors: Int (default: 5)
- refreshToken: String
- authToken: String
- monitors: Monitor[] (relation)
- createdAt: DateTime
- updatedAt: DateTime
```

### Monitor Model
```prisma
- id: Int (primary key)
- monitorName: String
- url: String
- interval: Int (check interval in seconds)
- lastChecked: DateTime
- status: String (UP | DOWN | UNKNOWN)
- userId: Int (foreign key)
- user: User (relation)
- createdAt: DateTime
- updatedAt: DateTime
```

## 🚦 Monitor Status Logic

The uptime worker runs every 30 seconds and checks monitors based on their configured intervals:

- **UP**: HTTP response status 200-399
- **DOWN**: HTTP response status 400+ or request failure
- **UNKNOWN**: Initial state before first check

## 📝 Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Create Monitor
```bash
curl -X POST http://localhost:3000/api/v1/monitors \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<token>" \
  -d '{
    "name": "My Website",
    "url": "https://example.com",
    "interval": 300
  }'
```

## 🔍 Project Structure

```
src/
├── config/               # Configuration files
│   └── prisma.js        # Prisma client setup
├── controllers/         # Request handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── monitor.controller.js
│   └── uptimeWroker.js  # Cron job for monitoring
├── middlewares/         # Express middleware
│   ├── auth.middleware.js
│   └── auth.ratelimiter.js
├── routes/             # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── monitor.routes.js
├── uilts/              # Utility functions
│   ├── generateToken.js
│   └── sendVerificationEmail.js
├── prisma/
│   └── schema.prisma   # Database schema
├── .env.sample         # Environment template
└── server.js          # Express app entry point
```

## 🐛 Known Issues & Notes

- Email validation currently restricted to `@example.com` domain (update in [auth.controller.js](src/controllers/auth.controller.js))
- Monitor name field in schema is `monitorName` but can be updated for consistency
- `forgetPassword` endpoint should be `POST /me/change-password` (currently at `/forget-password`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👨‍💻 Author

[sukhrajdev](https://github.com/sukhrajdev)

## 📞 Support

For issues and questions, please open an issue on [GitHub](https://github.com/sukhrajdev/NestVm-Open-Scoure/issues)

---

**Last Updated**: 2024