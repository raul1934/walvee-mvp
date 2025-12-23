# AI-Powered Trip Modification Feature

## Overview
Implement a feature where users can modify their trips through natural language by sending queries to Gemini AI. The AI will propose structured changes (ADD_CITY, REMOVE_CITY, ADD_PLACE, REMOVE_PLACE, ADD_ITINERARY) which the user can review and approve before applying to their trip.

## User Requirements (Confirmed)
- **Change Flow**: AI proposes changes → user approves/rejects → changes applied
- **Clarification**: AI asks questions WITH OPTIONS when uncertain
- **Trip Context**: Send full trip object to Gemini
- **Batch Operations**: Return all changes as separate individual operations

## Implementation Approach

### 1. Backend: Trip Modification Service
**New File**: [backend/src/services/tripModificationService.js](../src/services/tripModificationService.js)

This service handles all trip modification logic:

**Core Methods**:
- `applyChanges(tripId, userId, changes)` - Main entry point, uses transaction for atomicity
- `addCity(trip, data, transaction)` - Resolves city via Google Maps, adds to `trip_cities` table
- `removeCity(trip, data, transaction)` - Removes city and cascades to places/itinerary
- `addPlace(trip, data, transaction)` - Resolves place via Google Maps, adds to `trip_places`
- `removePlace(trip, data, transaction)` - Removes place from trip and itinerary activities
- `addItinerary(trip, data, transaction)` - Creates itinerary days with activities

**Helper Methods**:
- `resolveCity(cityName, countryName)` - Finds city in DB or fetches from Google Maps API
- `resolvePlace(placeId, placeName)` - Finds place in DB or fetches from Google Maps API
- `findCityInTrip(tripId, cityName, cityId)` - Locates city within trip
- `validateTripOwnership(tripId, userId)` - Security check

**Key Design Decisions**:
- Use single database transaction for all approved changes (rollback on any failure)
- Resolve Google Maps data during application (not during proposal)
- Reuse existing `googleMapsService.js` for city/place lookups
- Generate UUIDs using `const { v4: uuidv4 } = require('uuid')`

### 2. Backend: Inspire Controller Extension
**Modify File**: [backend/src/controllers/inspirePromptController.js](../src/controllers/inspirePromptController.js)

Add two new controller methods:

**Method 1: `modifyTrip(req, res)`**
- **Purpose**: Analyzes user query + trip context, returns proposed changes or clarification questions
- **Request Body**: `{ trip_id, user_query, conversation_history }`
- **Process**:
  1. Fetch full trip with cities, places, itinerary (use existing formatTripResponse pattern)
  2. Build system prompt with trip context
  3. Call Gemini with JSON schema for structured response
  4. Return either changes or clarification questions
- **Response Schema**:
```json
{
  "response_type": "changes" | "clarification",
  "message": "string",
  "changes": [
    {
      "operation": "ADD_CITY|REMOVE_CITY|ADD_PLACE|REMOVE_PLACE|ADD_ITINERARY",
      "operation_id": "string",
      "data": { /* operation-specific data */ },
      "reason": "string"
    }
  ],
  "questions": [
    {
      "question_id": "string",
      "question_text": "string",
      "options": [{ "option_id", "label", "value" }],
      "allow_freeform": false
    }
  ]
}
```

**Method 2: `applyChanges(req, res)`**
- **Purpose**: Applies approved changes to trip
- **Request Body**: `{ trip_id, changes: [{ operation_id, operation, approved, data }] }`
- **Process**:
  1. Validate trip ownership
  2. Filter approved changes
  3. Call `tripModificationService.applyChanges()`
  4. Return updated trip + success/failure results
- **Response**:
```json
{
  "success": true,
  "data": {
    "trip": { /* full updated trip object */ },
    "applied_changes": [{ "operation_id", "status": "success" }],
    "failed_changes": [{ "operation_id", "status": "failed", "error" }]
  }
}
```

**Prompt Engineering Strategy**:
```javascript
const buildTripModificationPrompt = (trip, userQuery, conversationHistory) => {
  const tripContext = JSON.stringify({
    id: trip.id,
    title: trip.title,
    cities: trip.cities.map(c => ({ id: c.id, name: c.name, country: c.country?.name })),
    places: trip.places.map(p => ({ name: p.name, city: extractCityFromPlace(p) })),
    itinerary: trip.itinerary.map(day => ({
      day: day.day_number,
      title: day.title,
      activities: day.activities.map(a => ({ name: a.name, time: a.time }))
    }))
  }, null, 2);

  return `You are Walvee's expert trip modification assistant.

CURRENT TRIP CONTEXT:
${tripContext}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

USER REQUEST: "${userQuery}"

YOUR CAPABILITIES:
1. ADD_CITY - Add a new destination city
2. REMOVE_CITY - Remove city (cascades to places/itinerary)
3. ADD_PLACE - Add specific place/activity
4. REMOVE_PLACE - Remove place from trip
5. ADD_ITINERARY - Create itinerary for a city

CRITICAL RULES:
- ACCURACY: Only propose changes that make sense
- VALIDATION: Check city/place exists before removing
- SPECIFICITY: Include Google Place IDs when adding places
- CLARIFICATION: Ask questions with OPTIONS when uncertain
- BATCH: Return ALL changes as separate operations
- REASONING: Include "reason" for each change

WHEN TO ASK CLARIFICATION (with OPTIONS):
- Ambiguous city names (e.g., "Paris" → offer Paris, France OR Paris, Texas)
- Vague requests (e.g., "add a museum" → offer specific museums)
- Missing preferences (e.g., budget unclear → offer Budget/Mid-range/Luxury)

EXAMPLES OF GOOD CLARIFICATION:
✅ "Which museum in Barcelona?" with options: ["Picasso Museum", "MACBA", "CosmoCaixa"]
✅ "What's your budget?" with options: ["Budget ($)", "Mid-range ($$)", "Luxury ($$$)"]

Remember: Users appreciate specific, actionable suggestions with clear reasoning.`;
};
```

### 3. Backend: API Routes
**Modify File**: [backend/src/routes/inspire.js](../src/routes/inspire.js)

Add two new routes:
```javascript
router.post('/modify-trip', authenticate, inspirePromptController.modifyTrip);
router.post('/apply-changes', authenticate, inspirePromptController.applyChanges);
```

### 4. Frontend: UI Components
**New File 1**: [frontend/src/components/inspire/ProposedChanges.jsx](../../frontend/src/components/inspire/ProposedChanges.jsx)

Component for displaying and managing proposed changes:
- **Props**: `{ changes, onApprove, onReject, isApplying }`
- **Features**:
  - List all changes with checkboxes for individual approval/rejection
  - Show operation icon (Plus for ADD_CITY, Trash for REMOVE_CITY, etc.)
  - Display reason for each change
  - "Apply N Changes" button (only applies checked items)
  - Cancel button to reject all
- **State**: Track which changes are approved/rejected

**New File 2**: [frontend/src/components/inspire/ClarificationQuestions.jsx](../../frontend/src/components/inspire/ClarificationQuestions.jsx)

Component for handling AI clarification questions:
- **Props**: `{ questions, onSubmitAnswers }`
- **Features**:
  - Display each question with radio buttons/options
  - Track answers in state
  - Enable submit only when all questions answered
  - Convert answers to follow-up message for AI
- **State**: `{ [question_id]: selected_value }`

### 5. Frontend: InspirePrompt Integration
**Modify File**: [frontend/src/pages/InspirePrompt.jsx](../../frontend/src/pages/InspirePrompt.jsx)

Add trip modification capability alongside existing recommendation flow:

**New State**:
```javascript
const [tripId, setTripId] = useState(null); // From URL params or props
const [proposedChanges, setProposedChanges] = useState(null);
const [clarificationQuestions, setClarificationQuestions] = useState(null);
const [isApplyingChanges, setIsApplyingChanges] = useState(false);
```

**Modified Submit Handler**:
```javascript
const handleSubmitWithTrip = async (e) => {
  e?.preventDefault();
  if (!inputValue.trim() || isLoadingResponse) return;

  const userMessage = { role: "user", content: inputValue, timestamp: Date.now() };
  setMessages(prev => [...prev, userMessage]);

  setInputValue("");
  setIsLoadingResponse(true);

  try {
    const response = await apiClient.post(endpoints.inspire.modifyTrip, {
      trip_id: tripId,
      user_query: inputValue,
      conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
    });

    const aiResponse = response.data;

    if (aiResponse.response_type === 'changes') {
      setProposedChanges(aiResponse.changes);
      const aiMessage = {
        role: "assistant",
        content: aiResponse.message,
        changes: aiResponse.changes,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);

    } else if (aiResponse.response_type === 'clarification') {
      setClarificationQuestions(aiResponse.questions);
      const aiMessage = {
        role: "assistant",
        content: aiResponse.message,
        questions: aiResponse.questions,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    }

  } catch (error) {
    console.error('[TripModification] Error:', error);
  } finally {
    setIsLoadingResponse(false);
  }
};
```

**New Handlers**:
```javascript
const handleApproveChanges = async (selectedChanges) => {
  setIsApplyingChanges(true);
  try {
    const response = await apiClient.post(endpoints.inspire.applyChanges, {
      trip_id: tripId,
      changes: selectedChanges
    });

    // Update local trip state with response.data.trip
    // Show success message
    // Clear proposed changes
    setProposedChanges(null);

  } catch (error) {
    console.error('[TripModification] Apply error:', error);
  } finally {
    setIsApplyingChanges(false);
  }
};

const handleRejectChanges = () => {
  setProposedChanges(null);
};

const handleSubmitClarificationAnswers = (answersText) => {
  setClarificationQuestions(null);
  setInputValue(answersText);
  handleSubmitWithTrip(); // Re-submit with answers
};
```

**Conditional Rendering**:
```jsx
{proposedChanges && (
  <ProposedChanges
    changes={proposedChanges}
    onApprove={handleApproveChanges}
    onReject={handleRejectChanges}
    isApplying={isApplyingChanges}
  />
)}

{clarificationQuestions && (
  <ClarificationQuestions
    questions={clarificationQuestions}
    onSubmitAnswers={handleSubmitClarificationAnswers}
  />
)}
```

### 6. Frontend: API Service
**Modify File**: [frontend/src/api/inspireService.js](../../frontend/src/api/inspireService.js)

Add new methods:
```javascript
export const modifyTrip = async (tripId, query, history = []) => {
  const response = await apiClient.post(endpoints.inspire.modifyTrip, {
    trip_id: tripId,
    user_query: query,
    conversation_history: history
  });
  return response.data;
};

export const applyChanges = async (tripId, changes) => {
  const response = await apiClient.post(endpoints.inspire.applyChanges, {
    trip_id: tripId,
    changes
  });
  return response.data;
};
```

**Update apiClient endpoints**:
```javascript
// In frontend/src/api/apiClient.js
inspire: {
  call: "/inspire/call",
  modifyTrip: "/inspire/modify-trip",
  applyChanges: "/inspire/apply-changes"
}
```

## Critical Files Summary

### Backend - New Files
1. `backend/src/services/tripModificationService.js` - Core modification logic

### Backend - Files to Modify
2. `backend/src/controllers/inspirePromptController.js` - Add modifyTrip() and applyChanges()
3. `backend/src/routes/inspire.js` - Add two new routes

### Frontend - New Files
4. `frontend/src/components/inspire/ProposedChanges.jsx` - Changes approval UI
5. `frontend/src/components/inspire/ClarificationQuestions.jsx` - Clarification UI

### Frontend - Files to Modify
6. `frontend/src/pages/InspirePrompt.jsx` - Integrate trip modification flow
7. `frontend/src/api/inspireService.js` - Add API methods
8. `frontend/src/api/apiClient.js` - Add endpoint definitions

## Error Handling & Validation

**Backend Validation**:
- Verify trip ownership before any operation
- Validate city/place exists before removal
- Check for duplicate cities/places before addition
- Handle Google Maps API failures gracefully
- Use try-catch within transaction loop to track individual failures

**Frontend Validation**:
- Require tripId before allowing modification requests
- Disable submit while loading
- Show clear error messages for failed changes
- Handle partial failures (some changes succeed, others fail)

**Edge Cases**:
- Empty trip (no cities yet) → AI focuses on ADD operations
- Non-existent city removal → Return error in failed_changes array
- Google Maps rate limit → Cache places, show friendly error
- User not trip owner → 403 Forbidden response

## Implementation Order

### Phase 1: Backend Foundation
1. Create `tripModificationService.js` with all operation handlers
2. Add `modifyTrip()` and `applyChanges()` to inspire controller
3. Add routes to `inspire.js`
4. Test with Postman/cURL

### Phase 2: Frontend Components
5. Create `ProposedChanges.jsx` component
6. Create `ClarificationQuestions.jsx` component
7. Update `inspireService.js` with API methods
8. Update `apiClient.js` endpoints

### Phase 3: Integration
9. Integrate components into `InspirePrompt.jsx`
10. Add state management for changes/questions
11. Test end-to-end flow
12. Handle loading states and errors

### Phase 4: Refinement
13. Refine Gemini system prompt based on testing
14. Polish UI/UX (animations, loading states)
15. Add comprehensive error handling
16. Test edge cases

## Database Considerations
**No migrations needed!** Existing schema supports all operations:
- `trip_cities` table (many-to-many cities)
- `trip_places` table
- `trip_itinerary_days` and `trip_itinerary_activities` tables
- `cities` and `places` tables with Google Maps integration

**Optional Enhancement** (not required for MVP):
Add `city_id` to `trip_itinerary_days` table to track which itinerary belongs to which city for cleaner REMOVE_CITY operations.

## Testing Strategy
1. **Unit Tests**: Test each operation in tripModificationService
2. **Integration Tests**: Test full flow from API to database
3. **AI Tests**: Test various user queries and verify correct operations
4. **Edge Case Tests**: Empty trips, invalid operations, partial failures
5. **User Acceptance**: Manual testing with real user scenarios

## Success Criteria
- ✅ User can modify trips via natural language
- ✅ AI proposes accurate changes with clear reasoning
- ✅ AI asks clarifying questions with options when uncertain
- ✅ User can approve/reject individual changes
- ✅ Changes apply correctly to database
- ✅ Error handling prevents data corruption
- ✅ UI provides clear feedback on success/failure
