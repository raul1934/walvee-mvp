# Walvee Backend API

Express.js backend with MySQL for the Walvee travel itinerary platform.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Google OAuth 2.0 credentials

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a MySQL database:

```sql
CREATE DATABASE walvee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

4. Run database migrations:

```bash
npm run migrate
```

5. (Optional) Seed the database with sample data:

```bash
npm run seed
```

## Development

Start the development server with auto-reload:

```bash
npm run dev
```

## Production

Start the production server:

```bash
npm start
```

## API Documentation

The API follows the OpenAPI 3.0 specification defined in `documentation.yaml`.

Base URL: `http://localhost:3000/v1`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

### Key Endpoints

- `GET /v1/auth/google` - Initiate Google OAuth
- `GET /v1/auth/google/callback` - OAuth callback
- `GET /v1/auth/me` - Get current user
- `GET /v1/trips` - List trips
- `POST /v1/trips` - Create trip
- `GET /v1/users` - List users
- `POST /v1/trip-likes` - Like a trip
- `POST /v1/follows` - Follow a user

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── database/        # Database connection and migrations
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── uploads/             # File uploads (local storage)
├── .env                 # Environment variables
└── package.json
```
