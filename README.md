# Obinne Hair Website - Backend API

A production-ready Node.js backend API built with TypeScript, Express, and TypeORM.

## 🚀 Features

- ✅ **TypeScript** - Full type safety
- ✅ **TypeORM** - Database ORM with PostgreSQL
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Role-Based Access Control** - Admin and User roles
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Security** - Helmet, CORS, Rate Limiting, Input Sanitization
- ✅ **Error Handling** - Centralized error management
- ✅ **Password Hashing** - Bcrypt for secure password storage

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/
│   │   └── auth.controller.ts   # Authentication logic
│   ├── entities/
│   │   └── User.ts              # User entity/model
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── error.middleware.ts  # Error handling
│   │   └── validation.middleware.ts  # Input validation
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth routes
│   │   └── index.ts             # Main router
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_DATABASE=obinne_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Create Database

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE obinne_db;
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Test the API

Health check endpoint:
```bash
curl http://localhost:5000/api/health
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

## 🔒 Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Configured for your frontend origin
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Sanitization** - Removes potentially harmful characters
- **Password Hashing** - Bcrypt with salt rounds of 10
- **JWT Tokens** - Secure authentication tokens

## 🏗️ Production Build

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run typeorm` - Run TypeORM CLI commands
- `npm run migration:generate` - Generate database migrations
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## 🗄️ Database Migrations

Generate a new migration:
```bash
npm run migration:generate -- -n MigrationName
```

Run migrations:
```bash
npm run migration:run
```

Revert last migration:
```bash
npm run migration:revert
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | `obinne_db` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🚨 Error Handling

The API uses a centralized error handling system:

- **AppError** - Custom error class for operational errors
- **Error Middleware** - Catches and formats all errors
- **404 Handler** - Handles undefined routes

## 🎯 Next Steps

1. **Add More Entities** - Create entities for your business logic (Products, Orders, etc.)
2. **Add More Controllers** - Implement business logic
3. **Add More Routes** - Define API endpoints
4. **Add Tests** - Write unit and integration tests
5. **Add Logging** - Implement proper logging (Winston, Morgan)
6. **Add Documentation** - Use Swagger/OpenAPI for API docs

## 📄 License

ISC
