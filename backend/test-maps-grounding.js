/**
 * Test script for Google Maps Grounding implementation
 *
 * This script tests the following endpoints with Maps Grounding:
 * 1. POST /inspire/recommendations - Get place recommendations
 * 2. POST /inspire/organize - Organize itinerary
 *
 * Usage:
 *   node test-maps-grounding.js
 *
 * Requirements:
 *   - Backend server running on http://localhost:3000 (or set BASE_URL env var)
 *   - Valid city_id in database (or use TEST_CITY_ID env var)
 *   - Authentication token (or run without auth for testing)
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_CITY_ID = process.env.TEST_CITY_ID || null; // Set your test city UUID
const AUTH_TOKEN = process.env.AUTH_TOKEN || null; // Optional: Set if endpoint requires auth

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Parse URL
function parseUrl(url) {
  const urlObj = new URL(url);
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname
  };
}

// Log helpers
function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

// Test 1: Recommendations Endpoint
async function testRecommendations() {
  logSection('TEST 1: /inspire/recommendations with Maps Grounding');

  const url = new URL('/inspire/recommendations', BASE_URL);
  const urlParts = parseUrl(url.href);

  const requestBody = {
    user_query: "Best pizza places with outdoor seating",
    filters: {
      interests: ["food", "italian"],
      budget: "mid-range"
    }
  };

  if (TEST_CITY_ID) {
    requestBody.city_id = TEST_CITY_ID;
    logInfo(`Using city_id: ${TEST_CITY_ID}`);
  } else {
    logWarning('No city_id provided - testing without city context');
  }

  const options = {
    ...urlParts,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (AUTH_TOKEN) {
    options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  try {
    logInfo(`Sending request to ${url.href}...`);
    const startTime = Date.now();

    const response = await makeRequest(options, requestBody);
    const latency = Date.now() - startTime;

    console.log(`\n${colors.bright}Response Status:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.bright}Latency:${colors.reset} ${latency}ms`);

    if (response.statusCode === 200) {
      const data = response.body.data || response.body;

      // Check for grounding indicators
      if (data.googleMapsWidgetContextToken) {
        logSuccess('Maps widget token present in response');
        console.log(`  Token: ${data.googleMapsWidgetContextToken.substring(0, 50)}...`);
      } else {
        logWarning('No Maps widget token in response');
      }

      // Check recommendations
      if (data.recommendations && Array.isArray(data.recommendations)) {
        logSuccess(`Received ${data.recommendations.length} recommendations`);

        let validPlaceIds = 0;
        let groundedPlaces = 0;

        data.recommendations.forEach((rec, idx) => {
          console.log(`\n  ${colors.bright}Recommendation ${idx + 1}:${colors.reset}`);
          console.log(`    Name: ${rec.name}`);
          console.log(`    Type: ${rec.type}`);

          if (rec.google_place_id && rec.google_place_id !== 'MANUAL_ENTRY_REQUIRED') {
            console.log(`    ${colors.green}Place ID: ${rec.google_place_id}${colors.reset}`);
            validPlaceIds++;
          } else {
            console.log(`    ${colors.red}Place ID: ${rec.google_place_id || 'MISSING'}${colors.reset}`);
          }

          if (rec.google_maps_uri) {
            console.log(`    ${colors.green}Maps URI: ${rec.google_maps_uri}${colors.reset}`);
            groundedPlaces++;
          }

          if (rec.enriched) {
            console.log(`    Rating: ${rec.enriched.rating || 'N/A'}`);
            console.log(`    Address: ${rec.enriched.address || 'N/A'}`);
          }
        });

        console.log(`\n${colors.bright}Summary:${colors.reset}`);
        console.log(`  Valid Place IDs: ${validPlaceIds}/${data.recommendations.length}`);
        console.log(`  Grounded (has Maps URI): ${groundedPlaces}/${data.recommendations.length}`);

        if (validPlaceIds === data.recommendations.length) {
          logSuccess('All recommendations have valid Place IDs');
        } else {
          logError(`${data.recommendations.length - validPlaceIds} recommendations missing valid Place IDs`);
        }

        if (groundedPlaces > 0) {
          logSuccess(`${groundedPlaces} recommendations have grounding metadata`);
        }
      } else {
        logError('No recommendations in response');
      }
    } else {
      logError(`Request failed with status ${response.statusCode}`);
      console.log('\nResponse:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    console.error(error);
  }
}

// Test 2: Organize Itinerary Endpoint
async function testOrganizeItinerary() {
  logSection('TEST 2: /inspire/organize with Maps Grounding');

  if (!TEST_CITY_ID) {
    logWarning('Skipping organize test - TEST_CITY_ID required');
    return;
  }

  const url = new URL('/inspire/organize', BASE_URL);
  const urlParts = parseUrl(url.href);

  const requestBody = {
    user_query: "Focus on morning activities and include lunch breaks",
    city_id: TEST_CITY_ID,
    days: 2,
    places: [
      { name: "Miami Beach", address: "Miami Beach, FL", rating: 4.5 },
      { name: "Art Deco Historic District", address: "Ocean Dr, Miami Beach, FL" },
      { name: "Vizcaya Museum and Gardens", address: "3251 S Miami Ave, Miami, FL" },
      { name: "Wynwood Walls", address: "2520 NW 2nd Ave, Miami, FL" },
      { name: "Bayside Marketplace", address: "401 Biscayne Blvd, Miami, FL" }
    ]
  };

  const options = {
    ...urlParts,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (AUTH_TOKEN) {
    options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  try {
    logInfo(`Sending request to ${url.href}...`);
    const startTime = Date.now();

    const response = await makeRequest(options, requestBody);
    const latency = Date.now() - startTime;

    console.log(`\n${colors.bright}Response Status:${colors.reset} ${response.statusCode}`);
    console.log(`${colors.bright}Latency:${colors.reset} ${latency}ms`);

    if (response.statusCode === 200) {
      const data = response.body.data || response.body;

      if (data.itinerary && Array.isArray(data.itinerary)) {
        logSuccess(`Received ${data.itinerary.length}-day itinerary`);

        data.itinerary.forEach((day, dayIdx) => {
          console.log(`\n  ${colors.bright}Day ${day.day}: ${day.title}${colors.reset}`);
          console.log(`    Description: ${day.description}`);

          if (day.places && Array.isArray(day.places)) {
            console.log(`    Places: ${day.places.length} activities`);

            day.places.forEach((place, placeIdx) => {
              console.log(`\n      ${placeIdx + 1}. ${place.name}`);
              console.log(`         Duration: ${place.estimated_duration || 'N/A'}`);
              console.log(`         Notes: ${place.notes || 'N/A'}`);

              if (place.google_place_id && place.google_place_id !== 'MANUAL_ENTRY_REQUIRED') {
                console.log(`         ${colors.green}Place ID: ${place.google_place_id}${colors.reset}`);
              } else {
                console.log(`         ${colors.red}Place ID: ${place.google_place_id || 'MISSING'}${colors.reset}`);
              }
            });
          }
        });

        // Check if places are organized by proximity (basic check)
        logInfo('\nAnalyzing route optimization...');
        console.log('  (Manual inspection recommended to verify proximity-based organization)');
      } else {
        logError('No itinerary in response');
      }
    } else {
      logError(`Request failed with status ${response.statusCode}`);
      console.log('\nResponse:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    console.error(error);
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         Google Maps Grounding Implementation Test Suite                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`City ID: ${TEST_CITY_ID || 'Not set (some tests will be skipped)'}`);
  logInfo(`Auth: ${AUTH_TOKEN ? 'Enabled' : 'Disabled'}\n`);

  try {
    await testRecommendations();
    await testOrganizeItinerary();

    logSection('Test Suite Complete');
    logSuccess('All tests executed');
    console.log('\nNext steps:');
    console.log('1. Review logs for grounding indicators');
    console.log('2. Verify Place IDs are valid (not "MANUAL_ENTRY_REQUIRED")');
    console.log('3. Check if googleMapsWidgetContextToken is present');
    console.log('4. Inspect server logs for grounding metadata messages');
    console.log('5. Compare latency with pre-grounding baseline\n');
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runTests();
