# 🚀 Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Database Setup

### Install PostgreSQL
If you don't have PostgreSQL installed:
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE obinne_db;

-- Verify
\l
```

## Step 2: Environment Configuration

Create a `.env` file in the server directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Database - Update these with your PostgreSQL credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_DATABASE=obinne_db

# JWT - Generate a random secret (use https://randomkeygen.com/)
JWT_SECRET=YOUR_RANDOM_SECRET_HERE_MAKE_IT_LONG_AND_SECURE
JWT_EXPIRES_IN=7d

# CORS - Update if your frontend runs on a different port
CORS_ORIGIN=http://localhost:5173
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
🚀 Server is running on port 5000
📍 Environment: development
🔗 API: http://localhost:5000/api
💚 Health Check: http://localhost:5000/api/health
```

## Step 5: Test the API

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2025-12-05T10:25:48.000Z"
}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@obinne.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Expected:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@obinne.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "user",
      "isActive": true
    },
    "token": "jwt-token-here"
  }
}
```

### Test 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@obinne.com",
    "password": "SecurePass123!"
  }'
```

### Test 4: Get Profile (Protected Route)
```bash
# Replace YOUR_TOKEN with the token from login/register response
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues & Solutions

### Issue 1: Database Connection Failed
**Error**: `Error during database initialization`

**Solution**:
1. Make sure PostgreSQL is running
2. Verify database credentials in `.env`
3. Check if database exists: `psql -U postgres -l`

### Issue 2: Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
1. Change PORT in `.env` to a different port (e.g., 5001)
2. Or kill the process using port 5000:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill`

### Issue 3: Module Not Found
**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: TypeScript Errors
**Error**: Various TypeScript compilation errors

**Solution**:
```bash
# Clean build
rm -rf dist
npm run build
```

## Next Steps

1. **Test all endpoints** - Make sure everything works
2. **Read the README** - Understand the project structure
3. **Check SETUP_CHECKLIST.md** - See what's completed and what's next
4. **Start building** - Add your business logic!

## Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Database
npm run migration:generate -- -n MigrationName  # Create migration
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration

# TypeORM CLI
npm run typeorm -- --help  # See all TypeORM commands
```

## Project Structure Overview

```
server/
├── src/
│   ├── config/          # Database & app configuration
│   ├── controllers/     # Business logic
│   ├── entities/        # Database models
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── migrations/      # Database migrations
│   ├── subscribers/     # TypeORM event listeners
│   ├── app.ts          # Express app setup
│   └── server.ts       # Entry point
├── .env                # Environment variables (create this!)
├── .env.example        # Environment template
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript config
└── README.md           # Full documentation
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get profile | Yes |

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Support

If you encounter any issues:
1. Check the error message carefully
2. Review the `.env` configuration
3. Check database connection
4. Review the logs in the terminal

## Success! 🎉

If you can:
- ✅ See the server running message
- ✅ Access the health check endpoint
- ✅ Register a new user
- ✅ Login successfully
- ✅ Access protected routes with token

**Your backend is working perfectly!** Start building your application! 🚀
