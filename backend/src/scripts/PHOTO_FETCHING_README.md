# Photo Fetching System for Cities and Places

This system automatically fetches and stores photos from Google Maps for cities and places that don't have images.

## Features

### 1. Automatic Photo Fetching

- When a new city or place is created in the database, the system automatically checks if it has photos
- If no photos exist and a `google_maps_id` (for cities) or `google_place_id` (for places) is available, photos are fetched from Google Maps
- Photos are fetched in the background without blocking the main operation

### 2. Manual Photo Verification Script

Run the script to check all existing cities and places without photos and fetch them:

```bash
cd backend
node src/scripts/fetch-missing-photos.js
```

This script will:

- Find all cities with `google_maps_id` but no photos
- Find all places with `google_place_id` but no photos
- Download photos from Google Maps API and save locally
- Store up to 5 photos per city and 10 photos per place (3 sizes each)
- Respect API rate limits with 200ms delay between requests
- Create directory structure automatically
- Retry failed downloads up to 3 times

### 3. Programmatic Photo Checking

You can use the utility functions in your code:

```javascript
const {
  ensureCityHasPhotos,
  ensurePlaceHasPhotos,
} = require("./utils/photoChecker");

// Check and fetch photos for a specific city
const city = await City.findByPk(cityId);
const photosAdded = await ensureCityHasPhotos(city);

// Check and fetch photos for a specific place
const place = await Place.findByPk(placeId);
const photosAdded = await ensurePlaceHasPhotos(place);
```

## How It Works

### Database Structure

**Cities:**

- `cities` table has `google_maps_id` field
- `city_photos` table stores multiple photos per city
- Photos are downloaded and stored locally in `/images/cities/{city_id}/` directory
- Each photo has 3 sizes: small (400px), medium (800px), large (1600px)

**Places:**

- `places` table has `google_place_id` field
- `place_photos` table stores multiple photos per place
- Photos are downloaded and stored locally in `/images/places/{place_id}/` directory
- Each photo has 3 sizes: small (400px), medium (800px), large (1600px)

### Photo Data Structure

Each photo record includes:

- `google_photo_reference`: Reference ID from Google Maps
- `url_small`: Local path like `/images/cities/1/0_small.jpg`
- `url_medium`: Local path like `/images/cities/1/0_medium.jpg`
- `url_large`: Local path like `/images/cities/1/0_large.jpg`
- `width` & `height`: Original dimensions
- `attribution`: Photo credit information
- `photo_order`: Display order (0-indexed)

### File Storage

Photos are downloaded from Google Maps API and stored locally:

- **Cities**: `backend/images/cities/{city_id}/{photo_order}_{size}.jpg`
- **Places**: `backend/images/places/{place_id}/{photo_order}_{size}.jpg`
- **Sizes**: `_small` (400px), `_medium` (800px), `_large` (1600px)
- **Permissions**: Files are created with 0644 permissions
- **Retry Logic**: 3 attempts with exponential backoff (2s, 4s, 8s)

## Model Hooks

The system uses Sequelize hooks to automatically trigger photo fetching:

```javascript
// City.js
City.afterCreate(async (city) => {
  const { checkCityPhotos } = require("../../utils/photoChecker");
  await checkCityPhotos(city);
});

// Place.js
Place.afterCreate(async (place) => {
  const { checkPlacePhotos } = require("../../utils/photoChecker");
  await checkPlacePhotos(place);
});
```

## Requirements

- Google Maps API key with Places API enabled
- `GOOGLE_MAPS_API_KEY` environment variable set
- Database with `cities`, `places`, `city_photos`, and `place_photos` tables

## Rate Limiting

The system includes built-in rate limiting:

- Manual script: 200ms delay between requests (max ~5 requests/second)
- Automatic hooks: Run in background via `setImmediate()`
- Respects Google Maps API quotas

## Error Handling

- Missing Google Maps IDs are logged but don't throw errors
- API failures are logged and don't block operations
- Already-existing photos are detected to avoid duplicates

## Monitoring

The system logs all operations:

- `[Photo Checker]` prefix for all photo-related logs
- Success: `✓ Saved X photos for [name]`
- Skip: `City/Place already has X photos`
- Warning: `No photos available for [name]`
- Error: Full error message with context

## Usage Examples

### Run manual photo fetch

```bash
node src/scripts/fetch-missing-photos.js
```

### Create a city with automatic photo fetching

```javascript
const city = await City.create({
  name: "Paris",
  country_id: 1,
  google_maps_id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
  latitude: 48.8566,
  longitude: 2.3522,
});
// Photos will be fetched automatically in the background
```

### Query cities with photos

```javascript
const city = await City.findByPk(cityId, {
  include: [
    {
      model: CityPhoto,
      as: "photos",
      order: [["photo_order", "ASC"]],
    },
  ],
});

// Access photos
const mainPhoto = city.photos[0]?.url_medium;
```

## Notes

- Photos are fetched asynchronously to not block user operations
- Google Maps API quotas apply (typically 100,000 requests/day)
- Photos URLs are direct links to Google's CDN
- Attribution text should be displayed when showing photos (stored in `attribution` field)
