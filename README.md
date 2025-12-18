# Walvee Express + MySQL Backend

✨ **Migration Complete!** Your backend has been successfully converted from Firebase to Express with MySQL.

## 📁 Project Structure

```
walvee/
├── backend/                    # Express Backend (NEW)
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── database/          # Database connection & migrations
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js   # NEW: API client for Express backend
│   │   └── ...
│   └── ...
│
├── documentation.yaml          # Complete API documentation (OpenAPI 3.0)
├── MIGRATION_GUIDE.md         # Detailed migration guide
└── setup-backend.ps1          # Quick setup script
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script:

```powershell
.\setup-backend.ps1
```

This will:

1. Install dependencies
2. Create `.env` file
3. Create MySQL database
4. Run migrations
5. Optionally seed sample data

### Option 2: Manual Setup

1. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Create MySQL Database**

   ```sql
   CREATE DATABASE walvee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run Migrations**

   ```bash
   npm run migrate
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Required Environment Variables

Edit `backend/.env`:

```env
# Database (Required)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=walvee
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secrets (Required)
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Google OAuth (Required for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session (Required)
SESSION_SECRET=your_session_secret_here
```

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

## 📚 API Documentation

Complete API documentation is available in `documentation.yaml` (OpenAPI 3.0 format).

### Key Endpoints

- **Authentication**

  - `GET /v1/auth/google` - Initiate Google OAuth
  - `GET /v1/auth/me` - Get current user
  - `POST /v1/auth/refresh` - Refresh access token

- **Trips**

  - `GET /v1/trips` - List all trips
  - `POST /v1/trips` - Create trip
  - `GET /v1/trips/:id` - Get trip details
  - `PUT /v1/trips/:id` - Update trip
  - `DELETE /v1/trips/:id` - Delete trip

- **Users**

  - `GET /v1/users` - List users
  - `GET /v1/users/:id` - Get user profile
  - `PUT /v1/users/me` - Update current user

- **Trip Likes**

  - `GET /v1/trip-likes` - Get user's favorites
  - `POST /v1/trip-likes` - Like a trip
  - `DELETE /v1/trip-likes/:id` - Unlike a trip

- **Follows**
  - `GET /v1/follows/followers/:userId` - Get followers
  - `GET /v1/follows/following/:userId` - Get following
  - `POST /v1/follows` - Follow user
    - `DELETE /v1/follows/:userId` - Unfollow user (authenticated follower)
    - `GET /v1/follows` - List follow records involving authenticated user (returns `user_follow` records)
    - `DELETE /v1/follows/record/:id` - Delete follow record by id (allowed if you're follower or followee)

## 🔄 Frontend Migration

### 1. Update Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/v1
```

### 2. Use the New API Client

The API client is ready at `frontend/src/api/apiClient.js`:

```javascript
import { apiClient, endpoints } from "../api/apiClient";

// Get all trips
const trips = await apiClient.get(endpoints.trips.list);

// Create a trip (requires authentication)
const newTrip = await apiClient.post(endpoints.trips.create, tripData);

// Upload an image
const result = await apiClient.upload(endpoints.upload.image, file);
```

### 3. Update Authentication Flow

```javascript
// Redirect to Google OAuth
const signIn = () => {
  window.location.href = `${apiConfig.baseURL}/auth/google`;
};

// Handle OAuth callback
const handleCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    apiClient.setToken(token);
    // Redirect to dashboard
  }
};
```

See `MIGRATION_GUIDE.md` for complete migration instructions.

## 🧪 Testing

### Test Backend Connection

```bash
curl http://localhost:3000/health
```

### Test API Endpoints

```bash
# Get all trips (public)
curl http://localhost:3000/v1/trips

# Get current user (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/v1/auth/me
```

## 📊 Database Schema

The backend uses MySQL with the following main tables:

- `users` - User accounts and profiles
- `trips` - Travel itineraries
- `trip_likes` - Trip favorites
- `follows` - User follow relationships
- `reviews` - Trip and place reviews
- `trip_derivations` - Trip copying/stealing tracking

## 🎯 Key Features Implemented

✅ Complete REST API following OpenAPI 3.0 specification  
✅ Google OAuth 2.0 authentication with JWT tokens  
✅ MySQL database with proper relationships  
✅ User profiles and metrics  
✅ Trip CRUD operations with visibility controls  
✅ Like/favorite system  
✅ Follow/unfollow users  
✅ Reviews for trips and places  
✅ Trip derivations (stealing/copying)  
✅ File upload support (local storage)  
✅ Pagination for all list endpoints  
✅ Input validation and error handling  
✅ Rate limiting  
✅ Security headers with Helmet

## 🔐 Security Features

- JWT token-based authentication
- Password-less auth via Google OAuth
- HTTP-only cookies for refresh tokens
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- SQL injection protection (parameterized queries)
- Input validation with express-validator

## 🚀 Production Deployment

For production deployment:

1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Use a production-ready MySQL instance
4. Set up HTTPS/SSL
5. Configure cloud storage (AWS S3, Google Cloud Storage, etc.)
6. Set up proper logging and monitoring
7. Use a process manager like PM2

## 📝 Notes

- The backend uses UUIDs for all IDs (instead of Firebase auto-generated IDs)
- File uploads are currently stored locally in the `uploads/` directory
- Real-time features are not included (would require WebSockets)
- All timestamps use MySQL's `TIMESTAMP` type with UTC timezone

## 🤝 Support

For issues or questions:

1. Check `MIGRATION_GUIDE.md` for detailed instructions
2. Review `documentation.yaml` for complete API specs
3. Check backend logs for error messages

## 📄 License

Proprietary
