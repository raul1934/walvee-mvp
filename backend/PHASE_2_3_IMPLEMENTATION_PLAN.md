# Phase 2 & 3 Implementation Plan: Google Maps Grounding

## Overview

**Phase 1 Status**: ✅ COMPLETE (All backend endpoints using Maps Grounding)

**Phase 2**: Frontend Widget Integration
**Phase 3**: Code Cleanup & Optimization

This document contains the complete implementation plan for completing the Google Maps Grounding integration in the Walvee application.

---

## Phase 2: Frontend Widget Integration

### 2A: Add Google Maps JavaScript API Script

**File**: `frontend/index.html`

**Current State**:
```html
<head>
  <meta charset="UTF-8" />
  <title>Walvee - Your best friend for trips...</title>
</head>
```

**Changes**:
Add Google Maps API script in `<head>` section:

```html
<head>
  <meta charset="UTF-8" />
  <title>Walvee - Your best friend for trips...</title>

  <!-- Google Maps API - Required for Maps Grounding widget -->
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=%VITE_GOOGLE_MAPS_API_KEY%&libraries=maps"
    type="text/javascript">
  </script>
</head>
```

**Environment Variable**:
Add to `.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

### 2B: Capture Widget Token in InspirePrompt.jsx

**File**: `frontend/src/pages/InspirePrompt.jsx`

**Current State** (Lines 1590-1612):
```javascript
const response = await getRecommendations({
  user_query: inputValue,
  conversation_history: messages,
  filters: selectedFilters,
  city_id: getActiveCityId(),
  trip_id: tripId,
});

setMessages((prev) => [
  ...prev,
  {
    role: "assistant",
    recommendations: response.recommendations || [],
    timestamp: new Date(),
  },
]);
```

**Changes**:

1. Add new state variable for widget token (around line 134):
```javascript
const [mapsWidgetToken, setMapsWidgetToken] = useState(null);
```

2. Extract token from response (modify lines 1590-1612):
```javascript
const response = await getRecommendations({
  user_query: inputValue,
  conversation_history: messages,
  filters: selectedFilters,
  city_id: getActiveCityId(),
  trip_id: tripId,
});

// Extract Maps widget token
if (response.googleMapsWidgetContextToken) {
  setMapsWidgetToken(response.googleMapsWidgetContextToken);
  console.log('[InspirePrompt] Maps widget token received');
}

setMessages((prev) => [
  ...prev,
  {
    role: "assistant",
    recommendations: response.recommendations || [],
    mapsWidgetToken: response.googleMapsWidgetContextToken,
    timestamp: new Date(),
  },
]);
```

3. Pass token to RecommendationModal (line 2870):
```javascript
<RecommendationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  recommendation={selectedRecommendation}
  mapsWidgetToken={mapsWidgetToken}  // ADD THIS
/>
```

---

### 2C: Add Widget Rendering in CityModalContent.jsx

**File**: `frontend/src/pages/InspirePrompt/components/RecommendationModal/CityModalContent.jsx`

**Current State** (Lines 14-19):
```javascript
const tabs = [
  { value: "all", label: "All Trips" },
  { value: "places", label: "Top Places" },
  { value: "locals", label: "Locals" },
  { value: "favorites", label: "Favorites" },
];
```

**Changes**:

1. Update component props (Line 6):
```javascript
const CityModalContent = ({ city, onTripClick, mapsWidgetToken }) => {
```

2. Add "Maps" tab:
```javascript
const tabs = [
  { value: "all", label: "All Trips" },
  { value: "places", label: "Top Places" },
  { value: "locals", label: "Locals" },
  { value: "favorites", label: "Favorites" },
  { value: "maps", label: "Maps" },  // ADD THIS
];
```

3. Add tab rendering for Maps widget (after line 197):
```javascript
{activeTab === "maps" && (
  <div className="maps-widget-container">
    {mapsWidgetToken ? (
      <iframe
        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(city.name)}&zoom=12`}
        width="100%"
        height="500"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    ) : (
      <div className="no-maps-message">
        <p>Maps widget not available for this city.</p>
      </div>
    )}
  </div>
)}
```

**Note**: The Google Maps widget implementation may need to use the Web Components approach instead:
```jsx
{activeTab === "maps" && mapsWidgetToken && (
  <div className="maps-widget-container">
    <gmp-place-contextual context-token={mapsWidgetToken} />
  </div>
)}
```

---

### 2D: Update RecommendationModal to Pass Token

**File**: `frontend/src/pages/InspirePrompt/components/RecommendationModal/RecommendationModal.jsx`

**Current State** (Line 6-12):
```javascript
const RecommendationModal = ({ isOpen, onClose, recommendation }) => {
```

**Changes**:

1. Add mapsWidgetToken prop:
```javascript
const RecommendationModal = ({ isOpen, onClose, recommendation, mapsWidgetToken }) => {
```

2. Pass token to CityModalContent (Line 52):
```javascript
<CityModalContent
  city={recommendation}
  onTripClick={handleTripClick}
  mapsWidgetToken={mapsWidgetToken}  // ADD THIS
/>
```

---

### 2E: OPTIONAL - Update Travel Tips Callers

**Finding**: The `generateDayTips()` and `generateTripTips()` functions are **NOT currently called anywhere** in the frontend.

**Options**:

**Option 1: Skip for now** (RECOMMENDED)
- Functions are ready with grounding support
- When callers are implemented in the future, they can pass city location
- No action needed

**Option 2: Add tips generation to TripDetails.jsx**
- File: `frontend/src/pages/TripDetails.jsx`
- Location: Around lines 1891-1893 where TravelerTips is rendered
- Would require fetching city location data and calling `generateDayTips()`

**Recommendation**: Skip Option 2 for now since tips aren't actively used. The functions are future-ready with grounding support.

---

## Phase 3: Code Cleanup & Optimization

### 3A: Simplify validateAndEnrichPlaceIds Function

**File**: `backend/src/services/inspirePromptService.js` (Lines 374-656)

**Current Complexity**: 282 lines with 3-tier validation:
1. Database lookup by Place ID
2. Database text search by name (fallback for invalid IDs)
3. Google Maps API validation with text search fallback

**Target Complexity**: ~100 lines with 2-tier validation:
1. Database lookup by Place ID (cache hit)
2. Google Maps API validation (cache miss)

**Code to Remove**:

**STEP 1B - Database Text Search (Lines 433-492):**
```javascript
// REMOVE THIS ENTIRE BLOCK
// With grounding, Place IDs are always valid - no need for name-based fallback
if (!enrichedPlace) {
  // Try searching by place name in the database
  const dbSearchResult = await Place.findOne({
    where: {
      name: { [Op.iLike]: `%${rec.name}%` },
      // ... 60 lines of fallback logic
    }
  });
}
```

**STEP 2B - Google Maps Text Search Fallback (Lines 542-630):**
```javascript
// REMOVE THIS ENTIRE BLOCK
// With grounding, Place IDs are pre-validated - text search fallback unnecessary
if (!placeDetailsResponse || placeDetailsResponse.status !== "OK") {
  console.log(`[Validate] Place ID ${rec.google_place_id} invalid, attempting text search`);
  const searchResult = await googleMapsService.searchPlace(rec.name, rec.city);
  // ... 89 lines of nested fallback logic
}
```

**Simplified Logic**:
```javascript
async function validateAndEnrichPlaceIds(recommendations, cityName = null) {
  const enrichedRecommendations = [];

  for (const rec of recommendations) {
    let enrichedPlace = null;

    // STEP 1: Check database cache
    if (rec.google_place_id && rec.google_place_id !== "MANUAL_ENTRY_REQUIRED") {
      enrichedPlace = await Place.findOne({
        where: { google_place_id: rec.google_place_id },
        include: [{ model: PlacePhoto, as: "photos" }]
      });

      if (enrichedPlace) {
        console.log(`[Validate] Cache hit for ${rec.name}`);
        enrichedRecommendations.push({ ...rec, enriched: enrichedPlace });
        continue;
      }
    }

    // STEP 2: Fetch from Google Maps API (no fallback needed)
    if (rec.google_place_id && rec.google_place_id !== "MANUAL_ENTRY_REQUIRED") {
      try {
        const placeDetails = await googleMapsService.getPlaceDetailsWithPhotos(
          rec.google_place_id
        );

        // Create database record
        const newPlace = await Place.create({
          google_place_id: rec.google_place_id,
          name: placeDetails.name,
          formatted_address: placeDetails.formatted_address,
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
          rating: placeDetails.rating,
          // ... other fields
        });

        enrichedPlace = newPlace;
        console.log(`[Validate] Created new place: ${rec.name}`);
      } catch (error) {
        console.error(`[Validate] Error fetching place details:`, error);
        // With grounding, this should rarely happen
        rec.google_place_id = "MANUAL_ENTRY_REQUIRED";
      }
    }

    enrichedRecommendations.push({ ...rec, enriched: enrichedPlace });
  }

  return enrichedRecommendations;
}
```

**Lines Reduced**: 282 → ~100 lines (64% reduction)

---

### 3B: Remove MANUAL_ENTRY_REQUIRED Checks

**Backend Files**:

**inspirePromptController.js (Line 497-503)**:
```javascript
// BEFORE
if (place.google_place_id && place.google_place_id !== "MANUAL_ENTRY_REQUIRED") {
  // Create database reference
}

// AFTER (simplified)
if (place.google_place_id) {
  // Create database reference
}
```

**tripController.js (Line 1388)**:
```javascript
// BEFORE
if (place_id && place_id !== "MANUAL_ENTRY_REQUIRED") {
  // Link to trip
}

// AFTER
if (place_id) {
  // Link to trip
}
```

**Frontend Files**:

**InspirePrompt.jsx (Lines 235-240)**:
```javascript
// BEFORE
.filter(rec =>
  rec.google_place_id &&
  rec.google_place_id !== "MANUAL_ENTRY_REQUIRED"
)

// AFTER
.filter(rec => rec.google_place_id)
```

---

### 3C: Deprecate or Remove Text Search Fallback

**File**: `backend/src/services/googleMapsService.js`

**searchPlace() function (Lines 249-283)**:
- Currently used only by `validateAndEnrichPlaceIds()` fallback
- With grounding, this is no longer needed for validation
- **Recommendation**: Keep for non-inspire endpoints (trip modification, general search)
- **Add deprecation notice**:

```javascript
/**
 * Search for a place using Google Maps Text Search API
 * @deprecated For validation - use Maps Grounding instead
 * Still used by: trip modification, general place search
 */
async searchPlace(query, city = null) {
  // ... existing implementation
}
```

---

### 3D: Update Documentation

**File**: `backend/MAPS_GROUNDING_IMPLEMENTATION.md`

**Update Phase 3 section**:
```markdown
### 🔄 Pending (Phase 3: Optimization)
- [x] Code cleanup: Simplified validation logic (removed 3-tier fallback)
- [x] Removed MANUAL_ENTRY_REQUIRED checks (5 locations)
- [x] Deprecated text search fallback for validation
- [ ] Documentation: Update API docs with widget token
- [ ] Add feature flag for grounding (environment variable)
```

**Add Cleanup Summary**:
```markdown
## Phase 3: Code Cleanup (COMPLETED)

### Code Reduction
- **validateAndEnrichPlaceIds()**: 282 lines → 100 lines (64% reduction)
- **Total lines removed**: ~150-200 lines across validation and error handling

### Simplified Validation Architecture
- **Before**: 3-tier (DB → DB Text Search → Google Maps + Text Search fallback)
- **After**: 2-tier (DB → Google Maps API)

### Files Modified
- `inspirePromptService.js` - Removed STEP 1B and STEP 2B fallbacks
- `inspirePromptController.js` - Removed MANUAL_ENTRY_REQUIRED checks
- `tripController.js` - Removed MANUAL_ENTRY_REQUIRED checks
- `InspirePrompt.jsx` - Removed MANUAL_ENTRY_REQUIRED filtering
- `googleMapsService.js` - Deprecated searchPlace() for validation use
```

---

## Implementation Order

### Phase 2: Frontend Widget (Estimated: 2-3 hours)

**Step 1**: Add Google Maps script to index.html
**Step 2**: Add widget token state to InspirePrompt.jsx
**Step 3**: Extract token from API responses
**Step 4**: Pass token through component hierarchy
**Step 5**: Add Maps tab to CityModalContent
**Step 6**: Render widget in tab content
**Step 7**: Test widget rendering with real recommendations

### Phase 3: Code Cleanup (Estimated: 2-3 hours)

**Step 1**: Simplify validateAndEnrichPlaceIds() function
**Step 2**: Remove STEP 1B (database text search fallback)
**Step 3**: Remove STEP 2B (Google Maps text search fallback)
**Step 4**: Remove MANUAL_ENTRY_REQUIRED checks (backend)
**Step 5**: Remove MANUAL_ENTRY_REQUIRED filtering (frontend)
**Step 6**: Add deprecation notice to searchPlace()
**Step 7**: Update documentation
**Step 8**: Test all inspire endpoints

---

## Testing Strategy

### Phase 2 Testing:

1. **Widget Token Verification**:
   - Make recommendation request with city_id
   - Verify `googleMapsWidgetContextToken` in response
   - Verify token stored in state
   - Check browser console for confirmation logs

2. **Widget Rendering**:
   - Open recommendation modal
   - Navigate to "Maps" tab
   - Verify Google Maps iframe/widget displays
   - Check for errors in browser console

3. **Fallback Behavior**:
   - Make request without city_id
   - Verify no widget token in response
   - Verify Maps tab shows fallback message

### Phase 3 Testing:

1. **Validation Simplification**:
   - Test recommendations with valid Place IDs from grounding
   - Verify places cached in database correctly
   - Verify no text search calls in logs
   - Check P95 latency improvement

2. **Error Handling**:
   - Verify no MANUAL_ENTRY_REQUIRED sentinels appear
   - Test edge cases (network errors, API failures)
   - Verify graceful degradation

3. **Regression Testing**:
   - Test all 3 inspire endpoints (recommendations, organize, modify-trip)
   - Verify place enrichment still works
   - Verify database caching still functions
   - Check photo fetching

---

## Rollback Plan

### Phase 2 Rollback:
- Remove Google Maps script from index.html
- Remove widget token state and extraction logic
- Remove Maps tab from CityModalContent
- No backend changes needed

### Phase 3 Rollback:
- Restore validateAndEnrichPlaceIds() from git history
- Restore MANUAL_ENTRY_REQUIRED checks
- Remove deprecation notice from searchPlace()
- Update documentation

---

## Success Metrics

### Phase 2:
- ✅ Widget token captured in 100% of responses (when city_id provided)
- ✅ Maps tab displays interactive widget
- ✅ No console errors when rendering widget
- ✅ Fallback message shown when token unavailable

### Phase 3:
- ✅ 150-200 lines of code removed
- ✅ No MANUAL_ENTRY_REQUIRED values in responses
- ✅ No text search fallback calls in logs
- ✅ Validation latency reduced by ~100-200ms (no fallback round-trips)
- ✅ All inspire endpoints still functional

---

## Files Summary

### Phase 2 Files to Modify:
1. `frontend/index.html` - Add Google Maps script
2. `frontend/src/pages/InspirePrompt.jsx` - Widget token state + extraction
3. `frontend/src/pages/InspirePrompt/components/RecommendationModal/RecommendationModal.jsx` - Pass token
4. `frontend/src/pages/InspirePrompt/components/RecommendationModal/CityModalContent.jsx` - Render widget
5. `frontend/.env.local` - Add VITE_GOOGLE_MAPS_API_KEY

### Phase 3 Files to Modify:
1. `backend/src/services/inspirePromptService.js` - Simplify validation (282 → 100 lines)
2. `backend/src/controllers/inspirePromptController.js` - Remove MANUAL_ENTRY_REQUIRED check
3. `backend/src/controllers/tripController.js` - Remove MANUAL_ENTRY_REQUIRED check
4. `backend/src/services/googleMapsService.js` - Deprecation notice
5. `frontend/src/pages/InspirePrompt.jsx` - Remove MANUAL_ENTRY_REQUIRED filter
6. `backend/MAPS_GROUNDING_IMPLEMENTATION.md` - Update Phase 3 status

---

## Next Steps After Phase 2 & 3

**Optional Future Enhancements**:
1. Add grounding to `/places/search` endpoint (semantic place search)
2. Add grounding to `/search/overlay` endpoint (conversational search)
3. Implement travel tips generation in TripDetails.jsx
4. A/B test widget engagement metrics
5. Add feature flag for grounding (environment variable)

---

**Last Updated**: December 26, 2024
**Status**: Ready for Implementation
