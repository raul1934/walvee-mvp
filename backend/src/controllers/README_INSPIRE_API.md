# Inspire API Documentation

This document describes the Inspire API endpoints and their response structures.

## Table of Contents
- [Endpoints](#endpoints)
- [Response Structure](#response-structure)
- [Field Definitions](#field-definitions)
- [Examples](#examples)

---

## Endpoints

### 1. POST `/inspire/recommendations`
Get AI-powered place/city recommendations based on user query.

**Request Body:**
```json
{
  "user_query": "I want to visit amazing beaches in Miami for scuba diving",
  "conversation_history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "filters": {
    "interests": ["beaches", "scuba diving"],
    "budget": "mid-range",
    "pace": "relaxed",
    "companions": "solo",
    "season": "summer"
  },
  "city_context": "Miami"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Here are some amazing beaches in Miami! 🏖️",
    "recommendations": [
      {
        "name": "South Beach",
        "type": "place",
        "description": "Famous beach with art deco architecture",
        "city": "Miami",
        "country": "United States",
        "why": "Perfect for beach lovers and diving",
        "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "place_id": "uuid-from-places-table",
        "city_id": "uuid-from-cities-table",
        "enriched": {
          "id": "uuid-from-places-table",
          "name": "South Beach",
          "address": "Miami Beach, FL, USA",
          "rating": 4.5,
          "price_level": 3,
          "latitude": 25.7907,
          "longitude": -80.1300,
          "types": ["beach", "tourist_attraction"],
          "photos": [...]
        }
      }
    ]
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "user_query is required"
}
```

---

### 2. POST `/inspire/organize`
Create a structured itinerary from a list of places.

**Request Body:**
```json
{
  "user_query": "Focus on morning activities",
  "city_name": "Miami",
  "places": [
    {
      "name": "South Beach",
      "address": "Miami Beach, FL",
      "rating": 4.5
    },
    {
      "name": "Art Deco District",
      "address": "Ocean Dr, Miami Beach, FL",
      "rating": 4.6
    }
  ],
  "days": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "itinerary": [
      {
        "day": 1,
        "title": "Miami Beach Exploration",
        "description": "Explore the iconic beaches and Art Deco architecture.",
        "places": [
          {
            "name": "South Beach",
            "estimated_duration": "3h",
            "notes": "Enjoy swimming and sunbathing. Great for photos!",
            "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
            "place_id": "uuid-from-places-table",
            "city_id": "uuid-from-cities-table",
            "enriched": { ... }
          },
          {
            "name": "Art Deco District",
            "estimated_duration": "2h",
            "notes": "Walk through colorful buildings and learn history.",
            "google_place_id": "ChIJXXXXXXXXXXXXXXXXXXX",
            "place_id": "uuid-from-places-table",
            "city_id": "uuid-from-cities-table",
            "enriched": { ... }
          }
        ]
      },
      {
        "day": 2,
        "title": "Nature and Adventure",
        "description": "Explore natural wonders.",
        "places": [ ... ]
      }
    ]
  }
}
```

---

## Response Structure

### Common Response Wrapper

All successful responses follow this structure:
```json
{
  "success": true,
  "data": { ... }
}
```

All error responses follow this structure:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

---

## Field Definitions

### Recommendation Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Name of the place, city, or activity |
| `type` | string | ✅ | Type: `"city"`, `"place"`, `"activity"`, `"business"` (or Portuguese equivalents) |
| `description` | string | ✅ | Brief description |
| `city` | string | ✅ | City name |
| `country` | string | ✅ | Country name |
| `why` | string | ✅ | Why this matches user's preferences |
| `google_place_id` | string | ✅ | Google Maps Place ID or `"MANUAL_ENTRY_REQUIRED"` |
| `place_id` | string | ❌ | Database UUID from `places` table (only if `google_place_id` is valid) |
| `city_id` | string | ❌ | Database UUID from `cities` table |
| `enriched` | object | ❌ | Enriched data from database or Google Maps API |

### Enriched Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Database UUID of the Place record |
| `name` | string | Official name from Google Maps |
| `address` | string \| null | Full formatted address |
| `rating` | number \| null | Google Maps rating (0-5) |
| `price_level` | number \| null | Price level (1-4) |
| `latitude` | number \| null | Latitude coordinate |
| `longitude` | number \| null | Longitude coordinate |
| `types` | string[] | Array of Google Maps place types |
| `photos` | object[] | Array of photo objects |

### Itinerary Place Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Place name |
| `estimated_duration` | string | ✅ | Duration (e.g., `"2h"`, `"30m"`) |
| `notes` | string | ✅ | Activity notes or tips |
| `google_place_id` | string | ✅ | Google Maps Place ID or `"MANUAL_ENTRY_REQUIRED"` |
| `place_id` | string | ❌ | Database UUID from `places` table |
| `city_id` | string | ❌ | Database UUID from `cities` table |
| `enriched` | object | ❌ | Enriched data (same structure as Recommendation) |

---

## Examples

### Example 1: City Recommendations

**Request:**
```bash
POST /inspire/recommendations
{
  "user_query": "I want to visit European cities",
  "filters": {
    "interests": ["culture", "history"],
    "budget": "mid-range"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Here are some amazing European cities for culture lovers! 🏛️",
    "recommendations": [
      {
        "name": "Paris",
        "type": "city",
        "description": "City of lights with world-class museums and architecture",
        "city": "Paris",
        "country": "France",
        "why": "Perfect for culture and history enthusiasts",
        "google_place_id": "MANUAL_ENTRY_REQUIRED",
        "city_id": "uuid-from-cities-table"
      },
      {
        "name": "Louvre Museum",
        "type": "place",
        "description": "World's largest art museum and historic monument",
        "city": "Paris",
        "country": "France",
        "why": "Must-visit for art and history lovers",
        "google_place_id": "ChIJD3uTd9hx5kcR1IQvGfr8dbk",
        "place_id": "uuid-from-places-table",
        "city_id": "uuid-from-cities-table",
        "enriched": {
          "id": "uuid-from-places-table",
          "name": "Louvre Museum",
          "address": "Rue de Rivoli, 75001 Paris, France",
          "rating": 4.7,
          "latitude": 48.8606,
          "longitude": 2.3376,
          "types": ["museum", "tourist_attraction"],
          "photos": [...]
        }
      }
    ]
  }
}
```

---

### Example 2: Place Recommendations with City Context

**Request:**
```bash
POST /inspire/recommendations
{
  "user_query": "Best restaurants for seafood",
  "city_context": "Miami"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Here are the best seafood restaurants in Miami! 🦞",
    "recommendations": [
      {
        "name": "Joe's Stone Crab",
        "type": "business",
        "description": "Iconic seafood restaurant since 1913",
        "city": "Miami",
        "country": "United States",
        "why": "Famous for stone crabs and fresh seafood",
        "google_place_id": "ChIJYYYYYYYYYYYYYYYYYYYYY",
        "place_id": "uuid-from-places-table",
        "city_id": "uuid-from-cities-table",
        "enriched": {
          "id": "uuid-from-places-table",
          "name": "Joe's Stone Crab",
          "address": "11 Washington Ave, Miami Beach, FL 33139",
          "rating": 4.4,
          "price_level": 4,
          "latitude": 25.7681,
          "longitude": -80.1343,
          "types": ["restaurant", "seafood_restaurant"],
          "photos": [...]
        }
      }
    ]
  }
}
```

---

### Example 3: Organize Itinerary

**Request:**
```bash
POST /inspire/organize
{
  "city_name": "Barcelona",
  "places": [
    { "name": "Sagrada Familia" },
    { "name": "Park Güell" },
    { "name": "La Rambla" },
    { "name": "Gothic Quarter" }
  ],
  "days": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itinerary": [
      {
        "day": 1,
        "title": "Gaudí Masterpieces",
        "description": "Explore Antoni Gaudí's iconic architectural works.",
        "places": [
          {
            "name": "Sagrada Familia",
            "estimated_duration": "2h",
            "notes": "Book tickets in advance. Visit early morning to avoid crowds.",
            "google_place_id": "ChIJi_n8fBiFpBIRjXvEWUYVKkI",
            "place_id": "uuid-from-places-table",
            "city_id": "uuid-from-cities-table"
          },
          {
            "name": "Park Güell",
            "estimated_duration": "2h",
            "notes": "Beautiful park with mosaic art. Great for sunset photos.",
            "google_place_id": "ChIJ4yaVt2yipBIRz6hVJRukofo",
            "place_id": "uuid-from-places-table",
            "city_id": "uuid-from-cities-table"
          }
        ]
      },
      {
        "day": 2,
        "title": "Historic Barcelona",
        "description": "Discover the historic heart of Barcelona.",
        "places": [
          {
            "name": "Gothic Quarter",
            "estimated_duration": "3h",
            "notes": "Wander through medieval streets and visit the cathedral.",
            "google_place_id": "ChIJ3TB7nQ2jpBIRgjBGMlXyjqw",
            "place_id": "uuid-from-places-table",
            "city_id": "uuid-from-cities-table"
          },
          {
            "name": "La Rambla",
            "estimated_duration": "1h",
            "notes": "Famous pedestrian street. Watch for pickpockets.",
            "google_place_id": "ChIJd1QNQ2qipBIRxpnjjRbXKRw",
            "place_id": "uuid-from-places-table",
            "city_id": "uuid-from-cities-table"
          }
        ]
      }
    ]
  }
}
```

---

## Database Integration

### Place Creation Flow

1. **AI generates recommendations** with `google_place_id`
2. **validateAndEnrichPlaceIds()** checks if Place exists in database:
   - **If exists:** Return database UUID as `place_id`, enrich with database data
   - **If not exists:** Validate with Google Maps API, create Place record, return UUID
   - **If invalid:** Set `google_place_id` to `"MANUAL_ENTRY_REQUIRED"`

### City Creation Flow

1. **enrichWithCityIds()** checks if City exists in database:
   - **Step 1:** Find or create Country record
   - **Step 2:** Find or create City record (linked to Country)
   - **Step 3:** Add `city_id` to recommendation

### Response Fields

| Field | Source | Purpose |
|-------|--------|---------|
| `google_place_id` | Google Maps API | Identifies the place in Google's system |
| `place_id` | Database (`places.id`) | UUID for database operations (trips, etc.) |
| `city_id` | Database (`cities.id`) | UUID for database operations (trips, etc.) |
| `enriched` | Database or Google Maps | Full place details for UI display |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Missing or invalid request parameters |
| `SERVICE_UNAVAILABLE` | 500 | Gemini API key not configured |
| `LLM_ERROR` | 500 | Error calling Gemini API or parsing response |

---

## Notes

- **Language Detection:** The API automatically detects if the user is writing in Portuguese or English
- **Grammar Checking:** AI responses are instructed to ensure perfect grammar
- **Place ID Validation:** All `google_place_id` values are validated against Google Maps API
- **Database Persistence:** Valid places are automatically saved to the database for future use
- **City Context:** When `city_context` is provided, recommendations are restricted to that city only
