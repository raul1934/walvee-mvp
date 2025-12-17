# Backend Migration Guide

This guide explains how to migrate from Firebase to the Express backend with MySQL.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update these important values:

- `DB_PASSWORD`: Your MySQL root password
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `JWT_SECRET`: A secure random string
- `JWT_REFRESH_SECRET`: Another secure random string
- `SESSION_SECRET`: Another secure random string

### 3. Create MySQL Database

```sql
CREATE DATABASE walvee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use the PowerShell command:

```powershell
mysql -u root -p -e "CREATE DATABASE walvee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. (Optional) Seed Sample Data

```bash
npm run seed
```

### 6. Start Backend Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The backend will be available at `http://localhost:3000/v1`

## Frontend Setup

### 1. Update Environment Variables

Create or update `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/v1
```

### 2. Update Frontend Code

The API client has been created at `frontend/src/api/apiClient.js`. You'll need to update your existing Firebase calls to use the new API client.

#### Example Migration:

**Before (Firebase):**

```javascript
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

const getTrips = async () => {
  const tripsCol = collection(db, "trips");
  const tripSnapshot = await getDocs(tripsCol);
  return tripSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
```

**After (Express):**

```javascript
import { apiClient, endpoints } from "../api/apiClient";

const getTrips = async () => {
  const response = await apiClient.get(endpoints.trips.list);
  return response.data;
};
```

### 3. Update Authentication

**Before (Firebase Auth):**

```javascript
import { auth } from "../config/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const signIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};
```

**After (Express):**

```javascript
import { apiConfig } from "../api/apiClient";

const signIn = () => {
  // Redirect to Google OAuth
  window.location.href = `${apiConfig.baseURL}/auth/google`;
};

// In your auth callback page:
const handleAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    apiClient.setToken(token);
    // Redirect to home or dashboard
  }
};
```

### 4. Update File Uploads

**Before (Firebase Storage):**

```javascript
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadImage = async (file) => {
  const storageRef = ref(storage, `images/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
```

**After (Express):**

```javascript
import { apiClient, endpoints } from "../api/apiClient";

const uploadImage = async (file) => {
  const response = await apiClient.upload(endpoints.upload.image, file);
  return response.data.fileUrl;
};
```

## API Documentation

All endpoints follow the OpenAPI specification in `documentation.yaml`.

### Common Patterns

#### Authentication

All protected endpoints require a Bearer token:

```javascript
// Token is automatically added by apiClient if set
apiClient.setToken(token);
```

#### Pagination

```javascript
const trips = await apiClient.get(endpoints.trips.list, {
  page: 1,
  limit: 20,
  sortBy: "created_at",
  order: "desc",
});
```

#### Error Handling

```javascript
try {
  const response = await apiClient.get(endpoints.trips.list);
  console.log(response.data);
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized
  } else if (error.status === 404) {
    // Handle not found
  }
  console.error(error.error.message);
}
```

## Testing the Backend

Use tools like Postman or curl to test endpoints:

```bash
# Get all trips (public)
curl http://localhost:3000/v1/trips

# Get current user (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/v1/auth/me

# Create a trip
curl -X POST http://localhost:3000/v1/trips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Trip","destination":"Paris","durationDays":3,"itinerary":[{"day":1,"places":[]}]}'
```

## Key Differences from Firebase

1. **Authentication**: Uses Google OAuth with JWT tokens instead of Firebase Auth
2. **Database**: MySQL with relational structure instead of Firestore documents
3. **Storage**: Local file system (can be upgraded to cloud storage later)
4. **Real-time**: No real-time updates (would need WebSockets or polling)
5. **IDs**: UUIDs instead of Firebase auto-generated IDs

## Next Steps

1. Update all Firebase imports in frontend code
2. Replace Firestore queries with API client calls
3. Update authentication flow
4. Test all features thoroughly
5. (Optional) Set up cloud storage for production
6. (Optional) Add WebSocket support for real-time features
