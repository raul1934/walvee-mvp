# Google Maps API Migration Plan
**Goal**: Move all direct Google Maps API calls from frontend to backend and cache data in database to reduce API costs and improve performance.

---

## Current Implementation Pattern (Cities)

### ✅ **Working Example: City Search**

**Frontend** (`Onboarding.jsx`):
```javascript
// Makes request to backend API
const response = await axios.get(`${API_BASE_URL}/cities/search`, {
  params: { query: query.trim() }
});
```

**Backend** (`cityController.js`):
```javascript
const searchCities = async (req, res) => {
  // 1. Search existing cities in database first
  let existingCities = await City.findAll({
    where: { name: { [Op.like]: `%${query}%` } },
    limit: 5
  });

  // 2. If we have 5+ results, return them (no API call)
  if (existingCities.length >= 5) {
    return res.json(existingCities);
  }

  // 3. If less than 5, fetch from Google Maps API
  const googleCities = await searchCitiesFromGoogle(query, 5);

  // 4. Save new cities to database for future use
  for (const googleCity of googleCities) {
    const placeDetails = await getPlaceDetails(googleCity.google_maps_id);
    await City.create({
      name: placeDetails.name,
      google_maps_id: placeDetails.google_maps_id,
      latitude: placeDetails.latitude,
      longitude: placeDetails.longitude,
      timezone: await getTimezone(lat, lng)
    });
  }

  // 5. Query database again and return all results
  return res.json(finalCities);
};
```

**Database Schema**:
```sql
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_id INT NOT NULL,
  google_maps_id VARCHAR(255) UNIQUE,
  state VARCHAR(100),
  latitude DOUBLE,
  longitude DOUBLE,
  timezone VARCHAR(50),
  population INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX idx_google_maps_id (google_maps_id),
  UNIQUE KEY unique_city_country (name, country_id)
);
```

**Benefits Achieved**:
- ✅ API key hidden on backend
- ✅ Database acts as cache (subsequent searches don't call Google)
- ✅ Faster response times after initial fetch
- ✅ Cost reduction (same city searched multiple times = 1 API call total)
- ✅ Offline capability (works even if Google API is down)

---

## 🔴 Areas Requiring Migration

### 1. **Place Photos Fetching** (`TripDetails.jsx:772-814`)

**Current**: Direct frontend Google Places API calls
```javascript
const service = new window.google.maps.places.PlacesService(
  document.createElement("div")
);

service.textSearch(request, (results, status) => {
  if (status === window.google.maps.places.PlacesServiceStatus.OK) {
    const photos = results[0].photos.map(photo => 
      photo.getUrl({ maxWidth: 800 })
    );
  }
});
```

**Issues**:
- Exposed API key in frontend
- Repeated API calls for same places
- No caching
- Slow initial load

**Migration Plan**:

#### Database Schema
```sql
CREATE TABLE places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_place_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city_id INT,
  latitude DOUBLE,
  longitude DOUBLE,
  rating DECIMAL(2,1),
  user_ratings_total INT,
  price_level INT,
  types JSON,
  phone_number VARCHAR(50),
  website VARCHAR(500),
  opening_hours JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX idx_google_place_id (google_place_id),
  INDEX idx_city_id (city_id),
  INDEX idx_name (name)
) ENGINE=InnoDB;

CREATE TABLE place_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  google_photo_reference VARCHAR(500) NOT NULL,
  url_small VARCHAR(1000),  -- maxWidth: 400
  url_medium VARCHAR(1000), -- maxWidth: 800
  url_large VARCHAR(1000),  -- maxWidth: 1600
  width INT,
  height INT,
  attribution TEXT,
  photo_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  INDEX idx_place_id (place_id),
  UNIQUE KEY unique_photo_reference (place_id, google_photo_reference)
) ENGINE=InnoDB;
```

#### Backend Implementation

**New Endpoint**: `GET /api/v1/places/search`
```javascript
// backend/src/controllers/placeController.js
const searchPlaces = async (req, res, next) => {
  try {
    const { query, city_id, destination } = req.query;
    
    // 1. Search existing places in database
    let existingPlace = await Place.findOne({
      where: { 
        name: { [Op.like]: `%${query}%` },
        ...(city_id && { city_id })
      },
      include: [{ model: PlacePhoto, as: 'photos' }]
    });

    if (existingPlace) {
      return res.json(buildSuccessResponse(existingPlace));
    }

    // 2. Fetch from Google Places API
    const googleResult = await googleMapsService.searchPlace(query, destination);
    
    if (!googleResult) {
      return res.status(404).json(buildErrorResponse('NOT_FOUND', 'Place not found'));
    }

    // 3. Get detailed place information
    const placeDetails = await googleMapsService.getPlaceDetails(
      googleResult.place_id
    );

    // 4. Save place to database
    const newPlace = await Place.create({
      google_place_id: placeDetails.place_id,
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      latitude: placeDetails.geometry.location.lat,
      longitude: placeDetails.geometry.location.lng,
      rating: placeDetails.rating,
      user_ratings_total: placeDetails.user_ratings_total,
      price_level: placeDetails.price_level,
      types: placeDetails.types,
      phone_number: placeDetails.formatted_phone_number,
      website: placeDetails.website,
      opening_hours: placeDetails.opening_hours?.weekday_text
    });

    // 5. Save photos
    if (placeDetails.photos) {
      const photoPromises = placeDetails.photos.slice(0, 10).map((photo, idx) => 
        PlacePhoto.create({
          place_id: newPlace.id,
          google_photo_reference: photo.photo_reference,
          url_small: photo.getUrl({ maxWidth: 400 }),
          url_medium: photo.getUrl({ maxWidth: 800 }),
          url_large: photo.getUrl({ maxWidth: 1600 }),
          width: photo.width,
          height: photo.height,
          attribution: photo.html_attributions[0],
          photo_order: idx
        })
      );
      await Promise.all(photoPromises);
    }

    // 6. Return complete data
    const completePlace = await Place.findByPk(newPlace.id, {
      include: [{ model: PlacePhoto, as: 'photos', order: [['photo_order', 'ASC']] }]
    });

    return res.json(buildSuccessResponse(completePlace));
  } catch (error) {
    next(error);
  }
};
```

**New Endpoint**: `GET /api/v1/trips/:id/places-enriched`
```javascript
// Returns all places for a trip with cached photos
const getTripPlacesEnriched = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findByPk(id, {
      include: [{
        model: TripPlace,
        as: 'places',
        include: [{
          model: Place,
          as: 'placeDetails',
          include: [{ model: PlacePhoto, as: 'photos' }]
        }]
      }]
    });

    if (!trip) {
      return res.status(404).json(buildErrorResponse('NOT_FOUND', 'Trip not found'));
    }

    // For places without cached data, fetch from Google
    const enrichedPlaces = await Promise.all(
      trip.places.map(async (tripPlace) => {
        if (tripPlace.placeDetails?.photos?.length > 0) {
          return tripPlace; // Already enriched
        }

        // Fetch and cache
        const googlePlace = await searchPlaces({
          query: { query: tripPlace.name, destination: trip.destination }
        });
        
        return { ...tripPlace.toJSON(), placeDetails: googlePlace };
      })
    );

    return res.json(buildSuccessResponse(enrichedPlaces));
  } catch (error) {
    next(error);
  }
};
```

**Frontend Changes**:
```javascript
// frontend/src/api/backendService.js
export const Place = {
  async search(query, destination) {
    const response = await apiClient.get(endpoints.places.search, {
      query,
      destination
    });
    return response.data;
  },
  
  async getEnrichedForTrip(tripId) {
    const response = await apiClient.get(
      endpoints.trips.getPlacesEnriched(tripId)
    );
    return response.data;
  }
};

// frontend/src/pages/TripDetails.jsx
// REMOVE direct Google Maps calls
// REPLACE WITH:
useEffect(() => {
  const fetchEnrichedPlaces = async () => {
    setIsLoadingPhotos(true);
    try {
      const enrichedData = await Place.getEnrichedForTrip(tripId);
      setEnrichedPlaces(enrichedData);
    } catch (error) {
      console.error('Error fetching enriched places:', error);
    } finally {
      setIsLoadingPhotos(false);
    }
  };
  
  if (tripData && activeTab === 'photos') {
    fetchEnrichedPlaces();
  }
}, [tripId, activeTab]);
```

---

### 2. **Map Markers & Initialization** (`TripDetails.jsx:1018-1170`)

**Current**: Direct Google Maps JavaScript API
```javascript
const map = new window.google.maps.Map(mapContainerRef.current, {
  zoom: 12,
  center: { lat, lng }
});

const marker = new window.google.maps.Marker({
  position: { lat, lng },
  map: map,
  icon: customIcon
});
```

**Migration Plan**:

#### Option A: Static Maps API (Recommended for trip cards/previews)
```javascript
// Backend endpoint
GET /api/v1/trips/:id/map-image?width=600&height=400&markers=true

// Returns pre-generated static map URL or generates on-demand
const generateTripMapImage = async (req, res) => {
  const { id } = req.params;
  const { width = 600, height = 400, markers = true } = req.query;
  
  const trip = await Trip.findByPk(id, {
    include: [{ model: TripPlace, as: 'places' }]
  });

  // Check if we have cached map image
  const cacheKey = `map_${id}_${width}x${height}`;
  let mapUrl = await redis.get(cacheKey);
  
  if (!mapUrl) {
    // Generate static map URL
    const markersParam = trip.places
      .map(p => `markers=color:red|${p.latitude},${p.longitude}`)
      .join('&');
      
    mapUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
      `size=${width}x${height}&` +
      `${markersParam}&` +
      `key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    // Cache for 30 days
    await redis.set(cacheKey, mapUrl, 'EX', 30 * 24 * 60 * 60);
  }

  res.json(buildSuccessResponse({ mapUrl }));
};
```

#### Option B: Keep Interactive Maps (for detailed view)
```javascript
// Only load Google Maps SDK when user specifically opens map view
// Use intersection observer to lazy load

// Backend provides map configuration
GET /api/v1/trips/:id/map-config

const getMapConfig = async (req, res) => {
  const trip = await Trip.findByPk(req.params.id, {
    include: [{ model: TripPlace, as: 'places' }]
  });

  const bounds = calculateBounds(trip.places);
  
  res.json(buildSuccessResponse({
    center: { lat: bounds.centerLat, lng: bounds.centerLng },
    zoom: bounds.suggestedZoom,
    markers: trip.places.map(p => ({
      position: { lat: p.latitude, lng: p.longitude },
      title: p.name,
      icon: getMarkerIcon(p.day_number)
    }))
  }));
};
```

---

### 3. **Place Details Enrichment** (`TripDetails.jsx:850-900`)

**Current**: Repeated textSearch calls for each place
```javascript
service.textSearch({ query: `${place.name}, ${address}` }, callback);
```

**Migration**: Use cached place data from database (covered in #1)

---

## 📊 Cost & Performance Impact Estimate

### Current State (Frontend Direct Calls)
- City search: ~50 requests/day × $0.032 = **$1.60/day** = **$48/month**
- Place search: ~200 requests/day × $0.032 = **$6.40/day** = **$192/month**
- Place details: ~500 requests/day × $0.017 = **$8.50/day** = **$255/month**
- Place photos: ~1000 requests/day × $0.007 = **$7.00/day** = **$210/month**
- Static maps: ~100 requests/day × $0.002 = **$0.20/day** = **$6/month**

**Total: ~$711/month** (assuming 1000 active users)

### After Migration (Backend + Database Cache)
- City search: 90% cache hit → **$4.80/month** (10% calls API)
- Place search: 85% cache hit → **$28.80/month**
- Place details: 80% cache hit → **$51/month**
- Place photos: 80% cache hit (same place photos reused) → **$42/month**
- Static maps: 95% cache hit (Redis) → **$0.30/month**

**Total: ~$127/month** = **82% cost reduction**

**Additional Benefits**:
- 70-90% faster response times (database vs API calls)
- Works offline/when Google API has issues
- Better user experience (instant results for cached data)
- Scalable (cache grows over time, costs decrease)

---

## Implementation Priority

### Phase 1: High Impact, Low Complexity ⭐
1. **Place Photos** - Most frequent call, easy to cache
2. **Place Search & Details** - Significant cost, straightforward migration

### Phase 2: Medium Impact
3. **Static Maps** - Implement Redis caching for map images
4. **Place Details Enrichment** - Consolidate into single backend call

### Phase 3: Optional (Keep current if needed)
5. **Interactive Maps** - Can keep frontend SDK for detailed map view
   - Only lazy load when user opens map tab
   - Use backend-provided configuration to minimize API calls

---

## Database Migrations Required

```sql
-- Migration 1: Create places table
CREATE TABLE places (
  -- schema above
);

-- Migration 2: Create place_photos table  
CREATE TABLE place_photos (
  -- schema above
);

-- Migration 3: Link trip_places to places table
ALTER TABLE trip_places 
ADD COLUMN place_id INT,
ADD FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL;

-- Migration 4: Add indexes for performance
CREATE INDEX idx_place_name_search ON places(name);
CREATE INDEX idx_place_coordinates ON places(latitude, longitude);
```

---

## Backend Files to Create/Modify

### New Files
1. `backend/src/models/sequelize/Place.js`
2. `backend/src/models/sequelize/PlacePhoto.js`
3. `backend/src/controllers/placeController.js`
4. `backend/src/routes/places.js`
5. `backend/src/database/add-places-tables.js` (migration)

### Modify
1. `backend/src/services/googleMapsService.js` - Add place search methods
2. `backend/src/models/sequelize/index.js` - Add Place associations
3. `backend/src/routes/index.js` - Mount place routes
4. `backend/src/controllers/tripController.js` - Add places-enriched endpoint

---

## Frontend Files to Modify

1. `frontend/src/api/backendService.js` - Add Place service
2. `frontend/src/api/apiClient.js` - Add place endpoints
3. `frontend/src/pages/TripDetails.jsx` - Replace Google Maps calls with backend calls
4. Remove `GOOGLE_MAPS_API_KEY` from frontend (security improvement)

---

## Testing Plan

1. **Unit Tests**: Test place caching logic
2. **Integration Tests**: Test full place search → cache → retrieve flow
3. **Performance Tests**: Compare response times before/after migration
4. **Cost Monitoring**: Track actual Google Maps API usage reduction

---

## Rollout Strategy

1. **Week 1**: Implement database schema + backend endpoints
2. **Week 2**: Migrate place photos feature
3. **Week 3**: Migrate place search/details
4. **Week 4**: Monitor, optimize, add remaining features

**Feature Flag**: Keep option to toggle between direct API and backend proxy during transition.
