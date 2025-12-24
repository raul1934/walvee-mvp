/**
 * Type definitions for Inspire API responses
 * These JSDoc comments provide IntelliSense and documentation
 */

/**
 * @typedef {Object} RecommendationEnriched
 * @property {string} id - Database UUID of the Place record
 * @property {string} name - Official name from Google Maps
 * @property {string|null} address - Full formatted address
 * @property {number|null} rating - Google Maps rating (0-5)
 * @property {number|null} price_level - Price level (1-4)
 * @property {number|null} latitude - Latitude coordinate
 * @property {number|null} longitude - Longitude coordinate
 * @property {string[]} types - Array of Google Maps place types
 * @property {Object[]} photos - Array of photo objects from Google Maps
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} name - Name of the place, city, or activity
 * @property {string} type - Type of recommendation: "city" | "place" | "activity" | "business" | "cidade" | "lugar" | "atividade" | "negócio"
 * @property {string} description - Brief description of the recommendation
 * @property {string} city - City name where this recommendation is located
 * @property {string} country - Country name
 * @property {string} why - Explanation of why this matches user's preferences
 * @property {string} google_place_id - Google Maps Place ID (e.g., "ChIJN1t_tDeuEmsRUsoyG83frY4") or "MANUAL_ENTRY_REQUIRED"
 * @property {string} [place_id] - Database UUID of the Place record (only present if google_place_id is valid)
 * @property {string} [city_id] - Database UUID of the City record
 * @property {RecommendationEnriched} [enriched] - Enriched data from database or Google Maps API (optional)
 */

/**
 * @typedef {Object} RecommendationsResponse
 * @property {string} message - Warm, friendly AI message (2-3 sentences with emojis)
 * @property {Recommendation[]} recommendations - Array of 9-15 recommendations
 */

/**
 * @typedef {Object} ItineraryPlace
 * @property {string} name - Place name
 * @property {string} estimated_duration - Duration (e.g., "2h", "30m")
 * @property {string} notes - Activity notes or tips
 * @property {string} google_place_id - Google Maps Place ID or "MANUAL_ENTRY_REQUIRED"
 * @property {string} [place_id] - Database UUID of the Place record (only present if google_place_id is valid)
 * @property {string} [city_id] - Database UUID of the City record
 * @property {RecommendationEnriched} [enriched] - Enriched data from database or Google Maps API (optional)
 */

/**
 * @typedef {Object} ItineraryDay
 * @property {number} day - Day number (1, 2, 3, ...)
 * @property {string} title - Short title for the day
 * @property {string} description - 1-2 sentence description of the day's theme
 * @property {ItineraryPlace[]} places - Array of places for this day
 */

/**
 * @typedef {Object} OrganizeItineraryResponse
 * @property {ItineraryDay[]} itinerary - Array of itinerary days
 */

/**
 * @typedef {Object} InspireSuccessResponse
 * @property {boolean} success - Always true for successful responses
 * @property {RecommendationsResponse|OrganizeItineraryResponse} data - Response data
 */

/**
 * @typedef {Object} InspireErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} error - Error code (e.g., "VALIDATION_ERROR", "LLM_ERROR")
 * @property {string} message - Human-readable error message
 */

module.exports = {};

// Example usage in controllers:
/**
 * @route   POST /inspire/recommendations
 * @desc    Get AI-powered place/city recommendations
 * @access  Private
 * @returns {InspireSuccessResponse} Success response with recommendations
 * @returns {InspireErrorResponse} Error response
 */

// Example response structures:

/**
 * EXAMPLE: Recommendations Response
 *
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Here are some amazing beaches in Miami! 🏖️ Perfect for scuba diving! 🤿",
 *     "recommendations": [
 *       {
 *         "name": "South Beach",
 *         "type": "place",
 *         "description": "Famous beach with art deco architecture and vibrant nightlife",
 *         "city": "Miami",
 *         "country": "United States",
 *         "why": "Perfect for beach lovers and diving enthusiasts",
 *         "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
 *         "place_id": "uuid-from-places-table",
 *         "city_id": "uuid-from-cities-table",
 *         "enriched": {
 *           "id": "uuid-from-places-table",
 *           "name": "South Beach",
 *           "address": "Miami Beach, FL, USA",
 *           "rating": 4.5,
 *           "price_level": 3,
 *           "latitude": 25.7907,
 *           "longitude": -80.1300,
 *           "types": ["beach", "tourist_attraction"],
 *           "photos": [...]
 *         }
 *       },
 *       {
 *         "name": "Bill Baggs Cape Florida State Park",
 *         "type": "place",
 *         "description": "Beautiful state park with lighthouse and pristine beaches",
 *         "city": "Miami",
 *         "country": "United States",
 *         "why": "Great for snorkeling and nature lovers",
 *         "google_place_id": "ChIJVVVVVVVVVVVVVVVVVVVVVVV",
 *         "place_id": "another-uuid-from-places-table",
 *         "city_id": "uuid-from-cities-table",
 *         "enriched": { ... }
 *       },
 *       {
 *         "name": "Miami",
 *         "type": "city",
 *         "description": "Vibrant coastal city with beaches, culture, and nightlife",
 *         "city": "Miami",
 *         "country": "United States",
 *         "why": "Main destination for your beach trip",
 *         "google_place_id": "MANUAL_ENTRY_REQUIRED",
 *         "city_id": "uuid-from-cities-table"
 *       }
 *     ]
 *   }
 * }
 */

/**
 * EXAMPLE: Organize Itinerary Response
 *
 * {
 *   "success": true,
 *   "data": {
 *     "itinerary": [
 *       {
 *         "day": 1,
 *         "title": "Miami Beach Exploration",
 *         "description": "Start your trip with the iconic South Beach and explore the Art Deco District.",
 *         "places": [
 *           {
 *             "name": "South Beach",
 *             "estimated_duration": "3h",
 *             "notes": "Enjoy swimming, sunbathing, and people watching. Great for photos!",
 *             "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
 *             "place_id": "uuid-from-places-table",
 *             "city_id": "uuid-from-cities-table",
 *             "enriched": { ... }
 *           },
 *           {
 *             "name": "Art Deco Historic District",
 *             "estimated_duration": "2h",
 *             "notes": "Walk through the colorful buildings and learn about Miami's history.",
 *             "google_place_id": "ChIJXXXXXXXXXXXXXXXXXXXXXXX",
 *             "place_id": "uuid-from-places-table",
 *             "city_id": "uuid-from-cities-table",
 *             "enriched": { ... }
 *           }
 *         ]
 *       },
 *       {
 *         "day": 2,
 *         "title": "Nature and Adventure",
 *         "description": "Explore natural wonders and outdoor activities.",
 *         "places": [
 *           {
 *             "name": "Bill Baggs Cape Florida State Park",
 *             "estimated_duration": "4h",
 *             "notes": "Snorkeling, hiking, and lighthouse tour. Bring sunscreen!",
 *             "google_place_id": "ChIJYYYYYYYYYYYYYYYYYYYYYYY",
 *             "place_id": "uuid-from-places-table",
 *             "city_id": "uuid-from-cities-table",
 *             "enriched": { ... }
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 */

/**
 * EXAMPLE: Error Response
 *
 * {
 *   "success": false,
 *   "error": "VALIDATION_ERROR",
 *   "message": "user_query is required"
 * }
 */
