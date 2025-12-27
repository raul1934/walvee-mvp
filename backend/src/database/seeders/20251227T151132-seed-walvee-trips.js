'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tripsData = [
  {
    "id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
    "title": "London's Royal Heritage",
    "description": "Explore British history, culture, and modern attractions.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 51.5074,
    "destination_lng": -0.1278,
    "is_public": true,
    "is_featured": false,
    "views_count": 65,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "name": "London",
        "country_id": "07dcfeed-c515-4e9f-95a2-5586a8eb6224",
        "google_maps_id": null,
        "state": null,
        "latitude": 51.5074,
        "longitude": -0.1278,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "07dcfeed-c515-4e9f-95a2-5586a8eb6224",
          "name": "United Kingdom",
          "code": "GB",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T10:35:59.000Z",
          "updated_at": "2025-12-27T10:35:59.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?london,cityscape",
            "id": "561bb04c-8309-4299-a2cc-07ec4201b451",
            "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
            "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?london,landmark",
            "id": "cb76aca2-30ef-49f8-986b-0e45fdce84cf",
            "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
            "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "e909615e-da62-4dd0-ab81-4afbbb5ffba4",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "history",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "ed37d430-f9cb-4191-a882-b0a8417b1e36",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "museums",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "714ba8f0-e234-4d96-ad15-60b254e2362f",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "9de08936-f845-461c-bc94-a7d7bdd019bd",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "e86f8772-84b5-4b9f-a15c-5304797dfdda",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "royal",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "day_number": 3,
        "title": "Day 3 in London",
        "description": "Explore the best of London",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "b1d6f666-57bb-41cc-84b4-046dcd64fb6d",
            "itinerary_day_id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "London",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "10b72b25-8b95-4acc-8037-ee1c940546e0",
            "itinerary_day_id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "London",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "165971d1-c2bb-4fea-b53f-2a9090d3972c",
            "itinerary_day_id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "London",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "6bd23913-60fd-441d-9b43-f716b7668c95",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "day_number": 1,
        "title": "Day 1 in London",
        "description": "Explore the best of London",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "47383ee3-4697-4086-90f2-136d9836724c",
            "itinerary_day_id": "6bd23913-60fd-441d-9b43-f716b7668c95",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "London",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "7ac737e6-4ca8-4813-9dd2-7fda5d317545",
            "itinerary_day_id": "6bd23913-60fd-441d-9b43-f716b7668c95",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "London",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f260772d-a4c4-405e-8835-6a8aeb9ba374",
            "itinerary_day_id": "6bd23913-60fd-441d-9b43-f716b7668c95",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "London",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "day_number": 2,
        "title": "Day 2 in London",
        "description": "Explore the best of London",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "1270d173-ca34-48d9-818b-01475be96a76",
            "itinerary_day_id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "London",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "2490e897-0031-40df-a655-b3b15d31e1eb",
            "itinerary_day_id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "London",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "4dbf8e71-8aca-4453-aad1-f4e4f6fb1585",
            "itinerary_day_id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "London",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "6a013b72-9cbd-49aa-b937-45bf3feea1c4",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "place_photo_id": null,
        "city_photo_id": "561bb04c-8309-4299-a2cc-07ec4201b451",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?london,cityscape",
          "id": "561bb04c-8309-4299-a2cc-07ec4201b451",
          "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
          "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "24a85518-5661-45d8-8125-cfca0f7f536e",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "place_photo_id": null,
        "city_photo_id": "cb76aca2-30ef-49f8-986b-0e45fdce84cf",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?london,landmark",
          "id": "cb76aca2-30ef-49f8-986b-0e45fdce84cf",
          "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
          "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "403cc734-b128-4675-b43d-19583dc36058",
    "title": "Tokyo Adventure: Modern Meets Traditional",
    "description": "Discover the perfect blend of ancient temples and futuristic technology.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 35.6762,
    "destination_lng": 139.6503,
    "is_public": true,
    "is_featured": false,
    "views_count": 83,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "name": "Tokyo",
        "country_id": "531bfa91-38a9-44c1-be13-edeaed99aee3",
        "google_maps_id": null,
        "state": null,
        "latitude": 35.6762,
        "longitude": 139.6503,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "531bfa91-38a9-44c1-be13-edeaed99aee3",
          "name": "Japan",
          "code": "JP",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:06:50.000Z",
          "updated_at": "2025-12-27T15:06:50.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?tokyo,cityscape",
            "id": "e5c9afaf-9d20-498d-b9e9-d9584a7ac270",
            "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
            "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?tokyo,landmark",
            "id": "dd04b903-31b0-4379-916e-ee612f43dd28",
            "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
            "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "9b05f8d6-7556-480f-b371-eb6dc1416e8b",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "b8dce546-49e7-4026-af68-50d19847ee63",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "temples",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "2be6bfcb-52dc-4aa2-80f1-179ce23bb18b",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "72713a0d-183f-47ac-bd8a-62487671cfc8",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "technology",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "74b8b198-5d3f-4737-99f0-79612388989f",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "97341083-50d9-46e0-a44a-09a70f120acc",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "day_number": 1,
        "title": "Day 1 in Tokyo",
        "description": "Explore the best of Tokyo",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "d5f1fbbd-0335-4ca6-8a1d-b19e1a70e8f8",
            "itinerary_day_id": "97341083-50d9-46e0-a44a-09a70f120acc",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Tokyo",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "3af93ae7-ca1e-4feb-bf1d-0e5c731b8c84",
            "itinerary_day_id": "97341083-50d9-46e0-a44a-09a70f120acc",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Tokyo",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "97b44991-f4bf-482b-8a82-295b36bc3b76",
            "itinerary_day_id": "97341083-50d9-46e0-a44a-09a70f120acc",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Tokyo",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "day_number": 2,
        "title": "Day 2 in Tokyo",
        "description": "Explore the best of Tokyo",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "3ed75ba5-6254-4868-ac86-b88519b56dd7",
            "itinerary_day_id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Tokyo",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "9f264a2c-843d-4870-bba2-d8e41f3e6804",
            "itinerary_day_id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Tokyo",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "de54c076-1137-4770-9bc9-9192f25ed516",
            "itinerary_day_id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Tokyo",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "day_number": 3,
        "title": "Day 3 in Tokyo",
        "description": "Explore the best of Tokyo",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "3b2715a7-eb48-4926-8984-cd6a99af1420",
            "itinerary_day_id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Tokyo",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "4e678418-569d-4584-b429-e45edc19dbc5",
            "itinerary_day_id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Tokyo",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ea83af08-0924-48e1-b036-9b49fc44c077",
            "itinerary_day_id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Tokyo",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "c4089223-f756-4cac-a21c-84e281154455",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "place_photo_id": null,
        "city_photo_id": "dd04b903-31b0-4379-916e-ee612f43dd28",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?tokyo,landmark",
          "id": "dd04b903-31b0-4379-916e-ee612f43dd28",
          "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
          "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "89ee36eb-f4ea-415f-8227-ef4cfb0aba8b",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "place_photo_id": null,
        "city_photo_id": "e5c9afaf-9d20-498d-b9e9-d9584a7ac270",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?tokyo,cityscape",
          "id": "e5c9afaf-9d20-498d-b9e9-d9584a7ac270",
          "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
          "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
    "title": "Ancient Rome and Italian Delights",
    "description": "Walk through history in the Eternal City.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 41.9028,
    "destination_lng": 12.4964,
    "is_public": true,
    "is_featured": false,
    "views_count": 17,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "db100867-e90b-4964-8269-4c5b053d6357",
        "name": "Rome",
        "country_id": "e4be2b3f-bafc-4d37-bfa3-3132b7be7af4",
        "google_maps_id": null,
        "state": null,
        "latitude": 41.9028,
        "longitude": 12.4964,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "e4be2b3f-bafc-4d37-bfa3-3132b7be7af4",
          "name": "Italy",
          "code": "IT",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?rome,landmark",
            "id": "31cbc213-b2a1-4c5c-8e1d-bc42d76266f9",
            "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
            "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?rome,cityscape",
            "id": "fd4e3b89-eb40-4e00-aa78-748566a652fc",
            "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
            "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "37450c9c-14b2-4b97-b72f-850939967cab",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "4fade439-3198-42a4-912e-93f268f53b03",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "74ed93f8-3849-4a2a-a7bd-b978bf1e49a1",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "romantic",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "9f196e86-9b71-4a66-87be-d16a91219d64",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "history",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "a5e29b04-dd2d-4805-8825-e3921c154086",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
        "day_number": 1,
        "title": "Day 1 in Rome",
        "description": "Explore the best of Rome",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "b5004846-dac7-4295-8209-7fe88ed7276b",
            "itinerary_day_id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Rome",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "bb09a5f7-a509-4f0c-893d-10c9496395d5",
            "itinerary_day_id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Rome",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e5ee5eb5-1948-438a-a32b-d6eb6c8ad0b5",
            "itinerary_day_id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Rome",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
        "day_number": 2,
        "title": "Day 2 in Rome",
        "description": "Explore the best of Rome",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "65772850-5a07-45c1-8b87-39e82e87873d",
            "itinerary_day_id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Rome",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "a4acd361-c3f2-44bb-aff3-2ea4c054e3cc",
            "itinerary_day_id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Rome",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ff4334a9-51b3-4405-ac55-d2d1813b4ed4",
            "itinerary_day_id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Rome",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
        "day_number": 3,
        "title": "Day 3 in Rome",
        "description": "Explore the best of Rome",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4098651c-dec8-4c69-9e9e-aaf81625693c",
            "itinerary_day_id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Rome",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "9e8f1fef-c4c8-450f-8c1c-6af84b8b4ba0",
            "itinerary_day_id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Rome",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "c12c9c15-06ff-4065-b7fb-e81bd23b6ab4",
            "itinerary_day_id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Rome",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "6b2fe941-55ee-4c48-abbb-afe12dff1ffa",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "place_photo_id": null,
        "city_photo_id": "fd4e3b89-eb40-4e00-aa78-748566a652fc",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?rome,cityscape",
          "id": "fd4e3b89-eb40-4e00-aa78-748566a652fc",
          "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
          "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "39374ae7-f1ef-45d2-a1aa-207acc2611df",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "place_photo_id": null,
        "city_photo_id": "31cbc213-b2a1-4c5c-8e1d-bc42d76266f9",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?rome,landmark",
          "id": "31cbc213-b2a1-4c5c-8e1d-bc42d76266f9",
          "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
          "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
    "title": "The Big Apple Experience",
    "description": "From Central Park to Times Square, experience NYC's energy.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 40.7128,
    "destination_lng": -74.006,
    "is_public": true,
    "is_featured": false,
    "views_count": 11,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "name": "New York",
        "country_id": "74745e91-f219-4c13-87aa-2c3a6581d366",
        "google_maps_id": null,
        "state": null,
        "latitude": 40.7128,
        "longitude": -74.006,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "74745e91-f219-4c13-87aa-2c3a6581d366",
          "name": "United States",
          "code": "US",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:06:50.000Z",
          "updated_at": "2025-12-27T15:06:50.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?new york,cityscape",
            "id": "b3af9aea-6112-444e-b949-101c1a5ea281",
            "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
            "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?new york,landmark",
            "id": "3f3fc42d-1813-4b1a-b660-90d509e0a07f",
            "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
            "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "1ec205d2-bc88-4597-8b88-14cd38420f0f",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "skyline",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "8d4123c6-e472-4ae9-ada8-64bf1e58de68",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "shopping",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "e11dd49f-de87-46af-aa43-ad7aec6d4ce6",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "e5ceba27-f4f5-4538-8922-29b26dc57834",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "060bf8f0-0078-4efb-9ff6-300db19ffe2a",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "museums",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "day_number": 1,
        "title": "Day 1 in New York",
        "description": "Explore the best of New York",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "ca96ac00-7a5a-4dab-b1ce-4b9f9eb1d554",
            "itinerary_day_id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "New York",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ec90d351-0457-4f19-9b08-e7a3e7af3603",
            "itinerary_day_id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "New York",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "1eabdf25-8b69-48be-b228-1999c4a85c6c",
            "itinerary_day_id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "New York",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "day_number": 2,
        "title": "Day 2 in New York",
        "description": "Explore the best of New York",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "92206619-5afa-433b-8c52-cb5a2aed25af",
            "itinerary_day_id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "New York",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "b371eb1c-59ad-44c9-b466-641c5668f8e8",
            "itinerary_day_id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "New York",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d9565d4d-4829-4c81-9bc2-b4c186435055",
            "itinerary_day_id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "New York",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "day_number": 3,
        "title": "Day 3 in New York",
        "description": "Explore the best of New York",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4a198b74-a55f-4c04-ac9a-172bd9f0c075",
            "itinerary_day_id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "New York",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "5cb1a0a8-f0f0-4883-aefb-98c02b498d57",
            "itinerary_day_id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "New York",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "afc03fc1-2bc3-4fca-a7cd-39fc27bcbcdb",
            "itinerary_day_id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "New York",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "c6a9e7d0-4065-47db-b982-25df537db8b3",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "place_photo_id": null,
        "city_photo_id": "3f3fc42d-1813-4b1a-b660-90d509e0a07f",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?new york,landmark",
          "id": "3f3fc42d-1813-4b1a-b660-90d509e0a07f",
          "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
          "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "a4ca3b21-aed3-4427-b291-9178cdfb4211",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "place_photo_id": null,
        "city_photo_id": "b3af9aea-6112-444e-b949-101c1a5ea281",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?new york,cityscape",
          "id": "b3af9aea-6112-444e-b949-101c1a5ea281",
          "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
          "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
    "title": "Canals and Culture in Amsterdam",
    "description": "Bike through charming streets and world-class museums.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 52.3676,
    "destination_lng": 4.9041,
    "is_public": true,
    "is_featured": false,
    "views_count": 5,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "name": "Amsterdam",
        "country_id": "077c1975-aec5-48fb-bcb3-1ba5e7e081ce",
        "google_maps_id": null,
        "state": null,
        "latitude": 52.3676,
        "longitude": 4.9041,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "077c1975-aec5-48fb-bcb3-1ba5e7e081ce",
          "name": "Netherlands",
          "code": "NL",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?amsterdam,landmark",
            "id": "ba0fc181-bf5b-47e2-9a61-0dacdedfed45",
            "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
            "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?amsterdam,cityscape",
            "id": "18cd37ac-46ef-4ad6-a429-430110b225b6",
            "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
            "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "075df8d3-1589-47ab-96de-3b40197e7114",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "0824370e-a9ab-4f44-b858-097ad996eab0",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "museums",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "68228bd1-3e0c-451d-ae22-c60d87d89edd",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "b36b01be-8bf2-47a9-b24e-f6cdc1703c3e",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "cycling",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "ef43497c-f2e2-4222-9483-5b2e101e0daa",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "vibrant",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "day_number": 1,
        "title": "Day 1 in Amsterdam",
        "description": "Explore the best of Amsterdam",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "3adeceb0-f8b9-400c-90d7-3072a5d0814c",
            "itinerary_day_id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Amsterdam",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "664ef5eb-fe6a-44cc-9a58-6c6266770088",
            "itinerary_day_id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Amsterdam",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "97cad38b-00d0-4828-bc38-3729360ce0c0",
            "itinerary_day_id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Amsterdam",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "day_number": 2,
        "title": "Day 2 in Amsterdam",
        "description": "Explore the best of Amsterdam",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "08346b43-72c2-4988-a368-2e60a81c81dc",
            "itinerary_day_id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Amsterdam",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "26c0fe78-6d62-413e-9e92-39a9e63771c0",
            "itinerary_day_id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Amsterdam",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "95223a4e-567c-4fba-a078-671ed84f0a66",
            "itinerary_day_id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Amsterdam",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "a6944a55-772d-4600-a942-7ee18df09624",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "day_number": 3,
        "title": "Day 3 in Amsterdam",
        "description": "Explore the best of Amsterdam",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "bf388e5f-0532-4ceb-bc14-10755f039a62",
            "itinerary_day_id": "a6944a55-772d-4600-a942-7ee18df09624",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Amsterdam",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ce8083a1-d14b-41d0-b0bc-ff52e9ca1223",
            "itinerary_day_id": "a6944a55-772d-4600-a942-7ee18df09624",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Amsterdam",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d216e6b5-2c37-449e-8e90-5aaca7dfa053",
            "itinerary_day_id": "a6944a55-772d-4600-a942-7ee18df09624",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Amsterdam",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d8f22762-57d9-41b4-b606-158320ac34de",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "place_photo_id": null,
        "city_photo_id": "18cd37ac-46ef-4ad6-a429-430110b225b6",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?amsterdam,cityscape",
          "id": "18cd37ac-46ef-4ad6-a429-430110b225b6",
          "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
          "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "213cfe0e-f36a-4191-a758-f527c2779fbe",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "place_photo_id": null,
        "city_photo_id": "ba0fc181-bf5b-47e2-9a61-0dacdedfed45",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?amsterdam,landmark",
          "id": "ba0fc181-bf5b-47e2-9a61-0dacdedfed45",
          "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
          "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
    "title": "Bangkok Street Food and Temples",
    "description": "A sensory journey through Thailand's vibrant capital.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 13.7563,
    "destination_lng": 100.5018,
    "is_public": true,
    "is_featured": false,
    "views_count": 22,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "name": "Bangkok",
        "country_id": "d7571cbd-2748-44e3-883e-f4a72ed84e3e",
        "google_maps_id": null,
        "state": null,
        "latitude": 13.7563,
        "longitude": 100.5018,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "d7571cbd-2748-44e3-883e-f4a72ed84e3e",
          "name": "Thailand",
          "code": "TH",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?bangkok,landmark",
            "id": "6848f8fc-54a9-4c6c-8df6-9d291c477d05",
            "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
            "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?bangkok,cityscape",
            "id": "82c1efef-fb4b-44a8-b470-dfb8e9c8da21",
            "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
            "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "0ffa270a-0d14-44f4-9ed9-21cbc418f81c",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "markets",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "7a10e75b-8020-4aae-b278-59ecc5e642a8",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "temples",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "bb87c7f0-d698-43ff-9ad7-8a8d82108676",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "bdaa7ad8-0eaa-4dc6-ac13-cb0e90c1532f",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "c7961ec0-703a-4ae1-b2c6-2368a14249f8",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "adventure",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "day_number": 1,
        "title": "Day 1 in Bangkok",
        "description": "Explore the best of Bangkok",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "d4b455b6-199a-4766-8f81-0699bf66d182",
            "itinerary_day_id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Bangkok",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f0cd151b-3954-412c-b488-587be0a100e0",
            "itinerary_day_id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Bangkok",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f563f8e9-4dbf-4dc6-b3db-3a0a1f166d4e",
            "itinerary_day_id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Bangkok",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "day_number": 2,
        "title": "Day 2 in Bangkok",
        "description": "Explore the best of Bangkok",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "39d60a9a-840f-47a0-97be-35c0fffcf51d",
            "itinerary_day_id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Bangkok",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "db3bf6ee-ba9e-40fa-a459-69c508c41949",
            "itinerary_day_id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Bangkok",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e249a9a2-5cdc-44d6-9d39-5196a1d04ac9",
            "itinerary_day_id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Bangkok",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "day_number": 3,
        "title": "Day 3 in Bangkok",
        "description": "Explore the best of Bangkok",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "42d7a12f-99eb-45c0-b16f-88c78d5d23e4",
            "itinerary_day_id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Bangkok",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "c3cc0577-a8fa-4ce2-82df-3eb90863bc50",
            "itinerary_day_id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Bangkok",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ca9d9242-ecb0-4431-ba2c-c14c53fc7263",
            "itinerary_day_id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Bangkok",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d5277a70-2776-4b0f-a03e-da859082b7bb",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "place_photo_id": null,
        "city_photo_id": "82c1efef-fb4b-44a8-b470-dfb8e9c8da21",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?bangkok,cityscape",
          "id": "82c1efef-fb4b-44a8-b470-dfb8e9c8da21",
          "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
          "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "a5c62eae-7c06-4fc2-bd30-4c89ca6b197b",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "place_photo_id": null,
        "city_photo_id": "6848f8fc-54a9-4c6c-8df6-9d291c477d05",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?bangkok,landmark",
          "id": "6848f8fc-54a9-4c6c-8df6-9d291c477d05",
          "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
          "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
    "title": "Sydney's Beaches and Opera House",
    "description": "Iconic landmarks and stunning coastal beauty.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": -33.8688,
    "destination_lng": 151.2093,
    "is_public": true,
    "is_featured": false,
    "views_count": 9,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "name": "Sydney",
        "country_id": "d84bda87-87e5-46ec-9837-733411d50018",
        "google_maps_id": null,
        "state": null,
        "latitude": -33.8688,
        "longitude": 151.2093,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "d84bda87-87e5-46ec-9837-733411d50018",
          "name": "Australia",
          "code": "AU",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?sydney,landmark",
            "id": "833a355a-e0f2-4068-b113-adc46b8fd57b",
            "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
            "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?sydney,cityscape",
            "id": "c289951b-466e-4879-8a54-9383d609df93",
            "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
            "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "4002b4fe-b54b-4397-969c-c8c3ff4fc5a3",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "beach",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "8a46eaa8-f807-4137-a4bb-230e33eece77",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "photography",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "a5d64cb7-d8fd-4b6f-a80e-74a649613425",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "nature",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "ab302ed6-d2ec-4de3-98f7-bc8c53f8dfff",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "f2688820-50d0-471a-8b27-a6c125cfc5d1",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "day_number": 1,
        "title": "Day 1 in Sydney",
        "description": "Explore the best of Sydney",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "25415a9c-5a18-4104-90c3-a9ae6f535fe7",
            "itinerary_day_id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Sydney",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d9a3150c-02d1-4911-807f-645e81ae6a80",
            "itinerary_day_id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Sydney",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ef13134b-8719-4378-9bfa-d1eb006825a5",
            "itinerary_day_id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Sydney",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "day_number": 2,
        "title": "Day 2 in Sydney",
        "description": "Explore the best of Sydney",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "8ee2c2ea-7f36-48be-a71b-ddb87d088325",
            "itinerary_day_id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Sydney",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "a72dccb2-7ef1-469b-ae13-235d52183b9a",
            "itinerary_day_id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Sydney",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e01e2840-aca7-4931-a74d-b8246bb99cbc",
            "itinerary_day_id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Sydney",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "day_number": 3,
        "title": "Day 3 in Sydney",
        "description": "Explore the best of Sydney",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "0195ac29-6d4d-4c26-b7e5-677f65b813e9",
            "itinerary_day_id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Sydney",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "34e89289-1aff-41fc-bf67-2e68621c853c",
            "itinerary_day_id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Sydney",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "3c9145eb-8347-4d1e-961b-6085218ef57b",
            "itinerary_day_id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Sydney",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d62650a5-df9b-487d-9957-5c7288fe2a33",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "place_photo_id": null,
        "city_photo_id": "833a355a-e0f2-4068-b113-adc46b8fd57b",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?sydney,landmark",
          "id": "833a355a-e0f2-4068-b113-adc46b8fd57b",
          "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
          "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "952884e3-22f5-496b-9a0d-b207961c3c63",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "place_photo_id": null,
        "city_photo_id": "c289951b-466e-4879-8a54-9383d609df93",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?sydney,cityscape",
          "id": "c289951b-466e-4879-8a54-9383d609df93",
          "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
          "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "7f6623b3-0c03-400a-a08b-2b4067917962",
    "title": "A Magical Weekend in Paris",
    "description": "Experience the romance and beauty of Paris in just 3 days.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 48.856614,
    "destination_lng": 2.3522219,
    "is_public": true,
    "is_featured": true,
    "views_count": 8,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "name": "Paris",
        "country_id": "cacb0bb2-dede-4564-aeaa-6d02a2a9b819",
        "google_maps_id": null,
        "state": null,
        "latitude": 48.856614,
        "longitude": 2.3522219,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:10:59.000Z",
        "updated_at": "2025-12-27T15:10:59.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "cacb0bb2-dede-4564-aeaa-6d02a2a9b819",
          "name": "France",
          "code": "FR",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T01:51:14.000Z",
          "updated_at": "2025-12-27T01:51:14.000Z",
          "deleted_at": null
        },
        "photos": []
      }
    ],
    "tags": [
      {
        "id": "43cb902f-216d-4b8a-91b5-26424589e809",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "photography",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "508eec52-6952-43cc-9093-005f010f2cfd",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "romantic",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "623ddcc5-8c3d-42fe-8192-06719e7ba869",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "bddfa0da-7563-436e-9f88-1f8c44d8fe9f",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "c18133fa-3b15-4f28-b439-c5502d1fd489",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "city_id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "day_number": 1,
        "title": "Day 1 in Paris",
        "description": "Explore the best of Paris",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "098527fe-2636-4400-b0ad-305f26c78181",
            "itinerary_day_id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Paris",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "27fba227-174f-4aa7-9dce-217bd6bb54e7",
            "itinerary_day_id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Paris",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "b5fc2242-d28b-43af-a079-2f18aff2bffd",
            "itinerary_day_id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Paris",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "city_id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "day_number": 2,
        "title": "Day 2 in Paris",
        "description": "Explore the best of Paris",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4bc38b25-fff8-4463-8d8d-84887589f0e0",
            "itinerary_day_id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Paris",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "7c9bad74-6b42-41e6-bebc-f979979d0ce8",
            "itinerary_day_id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Paris",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "aa69b22a-b711-44b8-a98e-d43e70ae5648",
            "itinerary_day_id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Paris",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "dc235f13-0618-4dff-8763-5e3805705104",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "city_id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "day_number": 3,
        "title": "Day 3 in Paris",
        "description": "Explore the best of Paris",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "d81c5183-c41c-411e-a18a-589c0e7574c8",
            "itinerary_day_id": "dc235f13-0618-4dff-8763-5e3805705104",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Paris",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e5bb8eb1-6dcf-4c87-a43d-ab46208a6347",
            "itinerary_day_id": "dc235f13-0618-4dff-8763-5e3805705104",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Paris",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e729484a-a45e-4f4c-8290-34d70a82145f",
            "itinerary_day_id": "dc235f13-0618-4dff-8763-5e3805705104",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Paris",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": []
  },
  {
    "id": "8084c0aa-4d60-45f5-86cc-991522867e84",
    "title": "Luxury and Desert in Dubai",
    "description": "Experience ultra-modern architecture and Arabian traditions.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 25.2048,
    "destination_lng": 55.2708,
    "is_public": true,
    "is_featured": false,
    "views_count": 72,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "name": "Dubai",
        "country_id": "d02531e5-a17e-45df-8e29-3e34871a82ff",
        "google_maps_id": null,
        "state": null,
        "latitude": 25.2048,
        "longitude": 55.2708,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "d02531e5-a17e-45df-8e29-3e34871a82ff",
          "name": "United Arab Emirates",
          "code": "AE",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T10:35:59.000Z",
          "updated_at": "2025-12-27T10:35:59.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?dubai,landmark",
            "id": "fe2eb6e0-1d91-4b04-ba44-dbd36febdee3",
            "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
            "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?dubai,cityscape",
            "id": "9d347b85-cc44-470f-a870-a48226a2117a",
            "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
            "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "3769d893-9e2d-406e-b970-0e4fce7719b6",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "shopping",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "3d535837-4227-4f4e-848c-311fe14ed784",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "adventure",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "41cda9e1-3c93-4131-9f1c-69fdd9904324",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "desert",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "d33928ac-b2e9-440d-a4f2-65a220f5ee7d",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "modern",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "fb0422e3-d2f0-4663-85ba-d25b1f5779eb",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "luxury",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "day_number": 1,
        "title": "Day 1 in Dubai",
        "description": "Explore the best of Dubai",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "26ae1dc5-a284-4dd0-81e9-0cd2e03ad885",
            "itinerary_day_id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Dubai",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "b989ec93-aad8-43c9-81e7-379f069da21f",
            "itinerary_day_id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Dubai",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d97f0eba-910d-4490-b985-ba6434c4e7c5",
            "itinerary_day_id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Dubai",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "day_number": 2,
        "title": "Day 2 in Dubai",
        "description": "Explore the best of Dubai",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "68d9a4d9-9804-4a96-bc05-f8fb6f96c2c3",
            "itinerary_day_id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Dubai",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "773816ae-f5b5-4855-a76a-9a7d3bbb3474",
            "itinerary_day_id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Dubai",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d97077a6-4b02-44bb-a1f7-64f80e240ce0",
            "itinerary_day_id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Dubai",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "day_number": 3,
        "title": "Day 3 in Dubai",
        "description": "Explore the best of Dubai",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "23b4da93-576e-4fbc-8182-be3063cca2c6",
            "itinerary_day_id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Dubai",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "2d7a4962-50e4-4b87-9016-27be8194bbc5",
            "itinerary_day_id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Dubai",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "38d8dba2-5bd0-4a6d-9576-38390be5335c",
            "itinerary_day_id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Dubai",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "89eba754-c18e-42ac-9d1f-e8d83de64d77",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "place_photo_id": null,
        "city_photo_id": "fe2eb6e0-1d91-4b04-ba44-dbd36febdee3",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?dubai,landmark",
          "id": "fe2eb6e0-1d91-4b04-ba44-dbd36febdee3",
          "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
          "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "06954c1e-89e8-4d24-ac08-903854350721",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "place_photo_id": null,
        "city_photo_id": "9d347b85-cc44-470f-a870-a48226a2117a",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?dubai,cityscape",
          "id": "9d347b85-cc44-470f-a870-a48226a2117a",
          "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
          "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
    "title": "Barcelona's Art and Architecture",
    "description": "Explore Gaudí's masterpieces and Mediterranean beaches.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 41.3874,
    "destination_lng": 2.1686,
    "is_public": true,
    "is_featured": false,
    "views_count": 35,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "name": "Barcelona",
        "country_id": "9e0bf162-3dd5-4be0-bfd3-d03b1d98cd40",
        "google_maps_id": null,
        "state": null,
        "latitude": 41.3874,
        "longitude": 2.1686,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "9e0bf162-3dd5-4be0-bfd3-d03b1d98cd40",
          "name": "Spain",
          "code": "ES",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?barcelona,landmark",
            "id": "18d5cc26-20aa-4dd4-8632-20c993b410fa",
            "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
            "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?barcelona,cityscape",
            "id": "e618b041-9bbd-43db-a0a4-66dc5e023e9f",
            "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
            "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "1a964e2f-6e92-4aba-9e75-24f0e3415cce",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "art",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "23e67f98-b903-4837-9487-385b42f0b4d0",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "82eed34a-20ec-4b35-87f9-b6d79c20c0da",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "849ebdad-8284-4b93-a3e9-c6b7c6b30a55",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "vibrant",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "c8ccdb08-b9aa-4a32-9b57-e0b49c641812",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "beach",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "day_number": 1,
        "title": "Day 1 in Barcelona",
        "description": "Explore the best of Barcelona",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "2a435d75-cb5b-425a-9ca9-67da7567f744",
            "itinerary_day_id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Barcelona",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "426043a4-3282-42c2-9b04-b7951bd7755a",
            "itinerary_day_id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Barcelona",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "c8eb47b8-4b31-46f0-8957-8e3ca8627013",
            "itinerary_day_id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Barcelona",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "4b9a1034-9aca-434e-8649-7e4320846d55",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "day_number": 2,
        "title": "Day 2 in Barcelona",
        "description": "Explore the best of Barcelona",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4643c0ac-ea3a-4439-91b4-b13e8341a666",
            "itinerary_day_id": "4b9a1034-9aca-434e-8649-7e4320846d55",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Barcelona",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "4b9dd3a7-83f2-4ad1-9a22-7a0fa4ba6b81",
            "itinerary_day_id": "4b9a1034-9aca-434e-8649-7e4320846d55",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Barcelona",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f2e94f11-e49d-4dc6-9671-1dda917b266f",
            "itinerary_day_id": "4b9a1034-9aca-434e-8649-7e4320846d55",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Barcelona",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "day_number": 3,
        "title": "Day 3 in Barcelona",
        "description": "Explore the best of Barcelona",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "35973ce3-8411-4b44-8973-be615d44597b",
            "itinerary_day_id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Barcelona",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "6a5f772b-ffcb-4ec2-8945-68e618621bb0",
            "itinerary_day_id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Barcelona",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ec8a0f8a-485e-45c0-93ee-2f7d12f51a49",
            "itinerary_day_id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Barcelona",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "f04c57cb-fdde-4691-bff0-c61f54122e13",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "place_photo_id": null,
        "city_photo_id": "e618b041-9bbd-43db-a0a4-66dc5e023e9f",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?barcelona,cityscape",
          "id": "e618b041-9bbd-43db-a0a4-66dc5e023e9f",
          "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
          "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "748b1701-4f0c-4c69-8c41-07b3f410c8ba",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "place_photo_id": null,
        "city_photo_id": "18d5cc26-20aa-4dd4-8632-20c993b410fa",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?barcelona,landmark",
          "id": "18d5cc26-20aa-4dd4-8632-20c993b410fa",
          "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
          "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  }
];

    // Process each trip
    for (const tripData of tripsData) {
      console.log(`Processing trip: ${tripData.title}`);

      // Create/update author
      if (tripData.author) {
        await queryInterface.bulkInsert('users', [{
          id: tripData.author.id,
          email: tripData.author.email,
          full_name: tripData.author.full_name,
          preferred_name: tripData.author.preferred_name,
          photo_url: tripData.author.photo_url,
          bio: tripData.author.bio,
          created_at: new Date(),
          updated_at: new Date(),
        }], { ignoreDuplicates: true });
      }

      // Create/update countries
      const countries = new Set();
      if (tripData.cities && tripData.cities.length > 0) {
        for (const city of tripData.cities) {
          if (city.country) {
            countries.add(JSON.stringify({
              id: city.country.id,
              name: city.country.name,
              code: city.country.code,
            }));
          }
        }
      }

      for (const countryStr of countries) {
        const country = JSON.parse(countryStr);
        await queryInterface.bulkInsert('countries', [{
          id: country.id,
          name: country.name,
          code: country.code,
          created_at: new Date(),
          updated_at: new Date(),
        }], { ignoreDuplicates: true });
      }

      // Create/update cities
      if (tripData.cities && tripData.cities.length > 0) {
        for (const city of tripData.cities) {
          await queryInterface.bulkInsert('cities', [{
            id: city.id,
            name: city.name,
            country_id: city.country?.id || null,
            latitude: city.latitude,
            longitude: city.longitude,
            created_at: new Date(),
            updated_at: new Date(),
          }], { ignoreDuplicates: true });

          // Insert city photos
          if (city.photos && city.photos.length > 0) {
            await queryInterface.bulkInsert('city_photos',
              city.photos.map(photo => ({
                id: photo.id,
                city_id: city.id,
                url: photo.url,
                photo_order: photo.photo_order || 0,
                created_at: new Date(),
              })),
              { ignoreDuplicates: true }
            );
          }
        }
      }

      // Create/update places
      if (tripData.places && tripData.places.length > 0) {
        for (const tripPlace of tripData.places) {
          if (tripPlace.place) {
            const place = tripPlace.place;
            await queryInterface.bulkInsert('places', [{
              id: place.id,
              google_place_id: place.google_place_id,
              name: place.name,
              address: place.address,
              latitude: place.latitude,
              longitude: place.longitude,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              price_level: place.price_level,
              types: JSON.stringify(place.types || []),
              city_id: place.city_id,
              created_at: new Date(),
              updated_at: new Date(),
            }], { ignoreDuplicates: true });

            // Insert place photos
            if (place.photos && place.photos.length > 0) {
              await queryInterface.bulkInsert('place_photos',
                place.photos.map(photo => ({
                  id: photo.id,
                  place_id: place.id,
                  url: photo.url,
                  photo_order: photo.photo_order || 0,
                  created_at: new Date(),
                })),
                { ignoreDuplicates: true }
              );
            }
          }
        }
      }

      // Create trip
      await queryInterface.bulkInsert('trips', [{
        id: tripData.id,
        author_id: tripData.author_id,
        title: tripData.title,
        description: tripData.description,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        duration: tripData.duration,
        budget: tripData.budget,
        transportation: tripData.transportation,
        accommodation: tripData.accommodation,
        best_time_to_visit: tripData.best_time_to_visit,
        difficulty_level: tripData.difficulty_level,
        trip_type: tripData.trip_type,
        is_public: tripData.is_public,
        is_featured: tripData.is_featured,
        is_draft: tripData.is_draft,
        views_count: tripData.views_count || 0,
        created_at: new Date(tripData.created_at),
        updated_at: new Date(tripData.updated_at),
      }], { ignoreDuplicates: true });

      // Create trip-city associations
      if (tripData.cities && tripData.cities.length > 0) {
        await queryInterface.bulkInsert('trip_cities',
          tripData.cities.map(city => ({
            trip_id: tripData.id,
            city_id: city.id,
            city_order: city.trip_cities?.city_order || city.Cities?.city_order || 0,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create tags
      if (tripData.tags && tripData.tags.length > 0) {
        await queryInterface.bulkInsert('trip_tags',
          tripData.tags.map(tag => ({
            id: tag.id,
            trip_id: tripData.id,
            tag: tag.tag,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create trip places
      if (tripData.places && tripData.places.length > 0) {
        await queryInterface.bulkInsert('trip_places',
          tripData.places.map(tp => ({
            id: tp.id,
            trip_id: tripData.id,
            place_id: tp.place_id,
            name: tp.name,
            address: tp.address,
            rating: tp.rating,
            price_level: tp.price_level,
            types: JSON.stringify(tp.types || []),
            description: tp.description,
            created_at: new Date(tp.created_at),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create itinerary days
      if (tripData.itineraryDays && tripData.itineraryDays.length > 0) {
        for (const day of tripData.itineraryDays) {
          await queryInterface.bulkInsert('trip_itinerary_days', [{
            id: day.id,
            trip_id: tripData.id,
            city_id: day.city_id,
            day_number: day.day_number,
            title: day.title,
            description: day.description,
            created_at: new Date(day.created_at),
          }], { ignoreDuplicates: true });

          // Create activities
          if (day.activities && day.activities.length > 0) {
            await queryInterface.bulkInsert('trip_itinerary_activities',
              day.activities.map(activity => ({
                id: activity.id,
                itinerary_day_id: day.id,
                time: activity.time,
                name: activity.name,
                location: activity.location,
                description: activity.description,
                activity_order: activity.activity_order,
                place_id: activity.place_id,
                created_at: new Date(activity.created_at),
              })),
              { ignoreDuplicates: true }
            );
          }
        }
      }

      // Create trip images
      if (tripData.images && tripData.images.length > 0) {
        await queryInterface.bulkInsert('trip_images',
          tripData.images.map(img => ({
            id: img.id,
            trip_id: tripData.id,
            place_photo_id: img.place_photo_id,
            city_photo_id: img.city_photo_id,
            image_order: img.image_order,
            created_at: new Date(img.created_at),
          })),
          { ignoreDuplicates: true }
        );
      }
    }

    console.log('Seeder completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    const tripsData = [
  {
    "id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
    "title": "London's Royal Heritage",
    "description": "Explore British history, culture, and modern attractions.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 51.5074,
    "destination_lng": -0.1278,
    "is_public": true,
    "is_featured": false,
    "views_count": 65,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "name": "London",
        "country_id": "07dcfeed-c515-4e9f-95a2-5586a8eb6224",
        "google_maps_id": null,
        "state": null,
        "latitude": 51.5074,
        "longitude": -0.1278,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "07dcfeed-c515-4e9f-95a2-5586a8eb6224",
          "name": "United Kingdom",
          "code": "GB",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T10:35:59.000Z",
          "updated_at": "2025-12-27T10:35:59.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?london,cityscape",
            "id": "561bb04c-8309-4299-a2cc-07ec4201b451",
            "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
            "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?london,landmark",
            "id": "cb76aca2-30ef-49f8-986b-0e45fdce84cf",
            "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
            "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "e909615e-da62-4dd0-ab81-4afbbb5ffba4",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "history",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "ed37d430-f9cb-4191-a882-b0a8417b1e36",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "museums",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "714ba8f0-e234-4d96-ad15-60b254e2362f",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "9de08936-f845-461c-bc94-a7d7bdd019bd",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "e86f8772-84b5-4b9f-a15c-5304797dfdda",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "tag": "royal",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "day_number": 3,
        "title": "Day 3 in London",
        "description": "Explore the best of London",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "b1d6f666-57bb-41cc-84b4-046dcd64fb6d",
            "itinerary_day_id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "London",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "10b72b25-8b95-4acc-8037-ee1c940546e0",
            "itinerary_day_id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "London",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "165971d1-c2bb-4fea-b53f-2a9090d3972c",
            "itinerary_day_id": "940e3418-0a19-4dfe-b108-9ac5c4948148",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "London",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "6bd23913-60fd-441d-9b43-f716b7668c95",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "day_number": 1,
        "title": "Day 1 in London",
        "description": "Explore the best of London",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "47383ee3-4697-4086-90f2-136d9836724c",
            "itinerary_day_id": "6bd23913-60fd-441d-9b43-f716b7668c95",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "London",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "7ac737e6-4ca8-4813-9dd2-7fda5d317545",
            "itinerary_day_id": "6bd23913-60fd-441d-9b43-f716b7668c95",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "London",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f260772d-a4c4-405e-8835-6a8aeb9ba374",
            "itinerary_day_id": "6bd23913-60fd-441d-9b43-f716b7668c95",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "London",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
        "day_number": 2,
        "title": "Day 2 in London",
        "description": "Explore the best of London",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "1270d173-ca34-48d9-818b-01475be96a76",
            "itinerary_day_id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "London",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "2490e897-0031-40df-a655-b3b15d31e1eb",
            "itinerary_day_id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "London",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "4dbf8e71-8aca-4453-aad1-f4e4f6fb1585",
            "itinerary_day_id": "0fce1c47-e0dd-45e4-8f2f-8a8774367cd4",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "London",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "6a013b72-9cbd-49aa-b937-45bf3feea1c4",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "place_photo_id": null,
        "city_photo_id": "561bb04c-8309-4299-a2cc-07ec4201b451",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?london,cityscape",
          "id": "561bb04c-8309-4299-a2cc-07ec4201b451",
          "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
          "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "24a85518-5661-45d8-8125-cfca0f7f536e",
        "trip_id": "ee1e3ebc-52b3-4ed9-b264-1cd77a749812",
        "place_photo_id": null,
        "city_photo_id": "cb76aca2-30ef-49f8-986b-0e45fdce84cf",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?london,landmark",
          "id": "cb76aca2-30ef-49f8-986b-0e45fdce84cf",
          "city_id": "775d37d2-960f-4aa1-aad0-9b69e7fc33c8",
          "google_photo_reference": "placeholder_775d37d2-960f-4aa1-aad0-9b69e7fc33c8_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "403cc734-b128-4675-b43d-19583dc36058",
    "title": "Tokyo Adventure: Modern Meets Traditional",
    "description": "Discover the perfect blend of ancient temples and futuristic technology.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 35.6762,
    "destination_lng": 139.6503,
    "is_public": true,
    "is_featured": false,
    "views_count": 83,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "name": "Tokyo",
        "country_id": "531bfa91-38a9-44c1-be13-edeaed99aee3",
        "google_maps_id": null,
        "state": null,
        "latitude": 35.6762,
        "longitude": 139.6503,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "531bfa91-38a9-44c1-be13-edeaed99aee3",
          "name": "Japan",
          "code": "JP",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:06:50.000Z",
          "updated_at": "2025-12-27T15:06:50.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?tokyo,cityscape",
            "id": "e5c9afaf-9d20-498d-b9e9-d9584a7ac270",
            "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
            "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?tokyo,landmark",
            "id": "dd04b903-31b0-4379-916e-ee612f43dd28",
            "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
            "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "9b05f8d6-7556-480f-b371-eb6dc1416e8b",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "b8dce546-49e7-4026-af68-50d19847ee63",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "temples",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "2be6bfcb-52dc-4aa2-80f1-179ce23bb18b",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "72713a0d-183f-47ac-bd8a-62487671cfc8",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "technology",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "74b8b198-5d3f-4737-99f0-79612388989f",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "97341083-50d9-46e0-a44a-09a70f120acc",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "day_number": 1,
        "title": "Day 1 in Tokyo",
        "description": "Explore the best of Tokyo",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "d5f1fbbd-0335-4ca6-8a1d-b19e1a70e8f8",
            "itinerary_day_id": "97341083-50d9-46e0-a44a-09a70f120acc",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Tokyo",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "3af93ae7-ca1e-4feb-bf1d-0e5c731b8c84",
            "itinerary_day_id": "97341083-50d9-46e0-a44a-09a70f120acc",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Tokyo",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "97b44991-f4bf-482b-8a82-295b36bc3b76",
            "itinerary_day_id": "97341083-50d9-46e0-a44a-09a70f120acc",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Tokyo",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "day_number": 2,
        "title": "Day 2 in Tokyo",
        "description": "Explore the best of Tokyo",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "3ed75ba5-6254-4868-ac86-b88519b56dd7",
            "itinerary_day_id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Tokyo",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "9f264a2c-843d-4870-bba2-d8e41f3e6804",
            "itinerary_day_id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Tokyo",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "de54c076-1137-4770-9bc9-9192f25ed516",
            "itinerary_day_id": "7f56bce2-c56b-4316-baa6-70c9343c82a2",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Tokyo",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
        "day_number": 3,
        "title": "Day 3 in Tokyo",
        "description": "Explore the best of Tokyo",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "3b2715a7-eb48-4926-8984-cd6a99af1420",
            "itinerary_day_id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Tokyo",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "4e678418-569d-4584-b429-e45edc19dbc5",
            "itinerary_day_id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Tokyo",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ea83af08-0924-48e1-b036-9b49fc44c077",
            "itinerary_day_id": "45aa14d9-2f8f-491f-80a4-a409629c0ffd",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Tokyo",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "c4089223-f756-4cac-a21c-84e281154455",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "place_photo_id": null,
        "city_photo_id": "dd04b903-31b0-4379-916e-ee612f43dd28",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?tokyo,landmark",
          "id": "dd04b903-31b0-4379-916e-ee612f43dd28",
          "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
          "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "89ee36eb-f4ea-415f-8227-ef4cfb0aba8b",
        "trip_id": "403cc734-b128-4675-b43d-19583dc36058",
        "place_photo_id": null,
        "city_photo_id": "e5c9afaf-9d20-498d-b9e9-d9584a7ac270",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?tokyo,cityscape",
          "id": "e5c9afaf-9d20-498d-b9e9-d9584a7ac270",
          "city_id": "0c002c40-322b-46e4-b87a-0eae07150397",
          "google_photo_reference": "placeholder_0c002c40-322b-46e4-b87a-0eae07150397_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
    "title": "Ancient Rome and Italian Delights",
    "description": "Walk through history in the Eternal City.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 41.9028,
    "destination_lng": 12.4964,
    "is_public": true,
    "is_featured": false,
    "views_count": 17,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "db100867-e90b-4964-8269-4c5b053d6357",
        "name": "Rome",
        "country_id": "e4be2b3f-bafc-4d37-bfa3-3132b7be7af4",
        "google_maps_id": null,
        "state": null,
        "latitude": 41.9028,
        "longitude": 12.4964,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "e4be2b3f-bafc-4d37-bfa3-3132b7be7af4",
          "name": "Italy",
          "code": "IT",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?rome,landmark",
            "id": "31cbc213-b2a1-4c5c-8e1d-bc42d76266f9",
            "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
            "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?rome,cityscape",
            "id": "fd4e3b89-eb40-4e00-aa78-748566a652fc",
            "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
            "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "37450c9c-14b2-4b97-b72f-850939967cab",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "4fade439-3198-42a4-912e-93f268f53b03",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "74ed93f8-3849-4a2a-a7bd-b978bf1e49a1",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "romantic",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "9f196e86-9b71-4a66-87be-d16a91219d64",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "history",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "a5e29b04-dd2d-4805-8825-e3921c154086",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
        "day_number": 1,
        "title": "Day 1 in Rome",
        "description": "Explore the best of Rome",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "b5004846-dac7-4295-8209-7fe88ed7276b",
            "itinerary_day_id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Rome",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "bb09a5f7-a509-4f0c-893d-10c9496395d5",
            "itinerary_day_id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Rome",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e5ee5eb5-1948-438a-a32b-d6eb6c8ad0b5",
            "itinerary_day_id": "7e74fa77-9c13-4f29-ba78-13abfb7df7fc",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Rome",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
        "day_number": 2,
        "title": "Day 2 in Rome",
        "description": "Explore the best of Rome",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "65772850-5a07-45c1-8b87-39e82e87873d",
            "itinerary_day_id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Rome",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "a4acd361-c3f2-44bb-aff3-2ea4c054e3cc",
            "itinerary_day_id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Rome",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ff4334a9-51b3-4405-ac55-d2d1813b4ed4",
            "itinerary_day_id": "3d5182f5-9d4c-43a9-b548-935c6d3ab686",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Rome",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
        "day_number": 3,
        "title": "Day 3 in Rome",
        "description": "Explore the best of Rome",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4098651c-dec8-4c69-9e9e-aaf81625693c",
            "itinerary_day_id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Rome",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "9e8f1fef-c4c8-450f-8c1c-6af84b8b4ba0",
            "itinerary_day_id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Rome",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "c12c9c15-06ff-4065-b7fb-e81bd23b6ab4",
            "itinerary_day_id": "cd6b5031-5b95-4098-85a1-ece4d67204e5",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Rome",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "6b2fe941-55ee-4c48-abbb-afe12dff1ffa",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "place_photo_id": null,
        "city_photo_id": "fd4e3b89-eb40-4e00-aa78-748566a652fc",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?rome,cityscape",
          "id": "fd4e3b89-eb40-4e00-aa78-748566a652fc",
          "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
          "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "39374ae7-f1ef-45d2-a1aa-207acc2611df",
        "trip_id": "4f450d1f-41d0-4293-b6b6-45e78f5892fd",
        "place_photo_id": null,
        "city_photo_id": "31cbc213-b2a1-4c5c-8e1d-bc42d76266f9",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?rome,landmark",
          "id": "31cbc213-b2a1-4c5c-8e1d-bc42d76266f9",
          "city_id": "db100867-e90b-4964-8269-4c5b053d6357",
          "google_photo_reference": "placeholder_db100867-e90b-4964-8269-4c5b053d6357_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
    "title": "The Big Apple Experience",
    "description": "From Central Park to Times Square, experience NYC's energy.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 40.7128,
    "destination_lng": -74.006,
    "is_public": true,
    "is_featured": false,
    "views_count": 11,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "name": "New York",
        "country_id": "74745e91-f219-4c13-87aa-2c3a6581d366",
        "google_maps_id": null,
        "state": null,
        "latitude": 40.7128,
        "longitude": -74.006,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "74745e91-f219-4c13-87aa-2c3a6581d366",
          "name": "United States",
          "code": "US",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:06:50.000Z",
          "updated_at": "2025-12-27T15:06:50.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?new york,cityscape",
            "id": "b3af9aea-6112-444e-b949-101c1a5ea281",
            "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
            "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?new york,landmark",
            "id": "3f3fc42d-1813-4b1a-b660-90d509e0a07f",
            "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
            "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "1ec205d2-bc88-4597-8b88-14cd38420f0f",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "skyline",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "8d4123c6-e472-4ae9-ada8-64bf1e58de68",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "shopping",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "e11dd49f-de87-46af-aa43-ad7aec6d4ce6",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "e5ceba27-f4f5-4538-8922-29b26dc57834",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "060bf8f0-0078-4efb-9ff6-300db19ffe2a",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "tag": "museums",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "day_number": 1,
        "title": "Day 1 in New York",
        "description": "Explore the best of New York",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "ca96ac00-7a5a-4dab-b1ce-4b9f9eb1d554",
            "itinerary_day_id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "New York",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ec90d351-0457-4f19-9b08-e7a3e7af3603",
            "itinerary_day_id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "New York",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "1eabdf25-8b69-48be-b228-1999c4a85c6c",
            "itinerary_day_id": "103f4ca1-35b2-41d5-9279-838ab0b61bfe",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "New York",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "day_number": 2,
        "title": "Day 2 in New York",
        "description": "Explore the best of New York",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "92206619-5afa-433b-8c52-cb5a2aed25af",
            "itinerary_day_id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "New York",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "b371eb1c-59ad-44c9-b466-641c5668f8e8",
            "itinerary_day_id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "New York",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d9565d4d-4829-4c81-9bc2-b4c186435055",
            "itinerary_day_id": "a879d8d0-19a8-4f59-9671-6a9dc46598c9",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "New York",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
        "day_number": 3,
        "title": "Day 3 in New York",
        "description": "Explore the best of New York",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4a198b74-a55f-4c04-ac9a-172bd9f0c075",
            "itinerary_day_id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "New York",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "5cb1a0a8-f0f0-4883-aefb-98c02b498d57",
            "itinerary_day_id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "New York",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "afc03fc1-2bc3-4fca-a7cd-39fc27bcbcdb",
            "itinerary_day_id": "2e82948b-6b31-4e43-9be1-c3793c4d7afb",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "New York",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "c6a9e7d0-4065-47db-b982-25df537db8b3",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "place_photo_id": null,
        "city_photo_id": "3f3fc42d-1813-4b1a-b660-90d509e0a07f",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?new york,landmark",
          "id": "3f3fc42d-1813-4b1a-b660-90d509e0a07f",
          "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
          "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "a4ca3b21-aed3-4427-b291-9178cdfb4211",
        "trip_id": "9abdfc7f-d04f-407c-ab2d-bb37fe8a1491",
        "place_photo_id": null,
        "city_photo_id": "b3af9aea-6112-444e-b949-101c1a5ea281",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?new york,cityscape",
          "id": "b3af9aea-6112-444e-b949-101c1a5ea281",
          "city_id": "4bdb11f0-6268-4fce-a496-c9907b3513c8",
          "google_photo_reference": "placeholder_4bdb11f0-6268-4fce-a496-c9907b3513c8_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
    "title": "Canals and Culture in Amsterdam",
    "description": "Bike through charming streets and world-class museums.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 52.3676,
    "destination_lng": 4.9041,
    "is_public": true,
    "is_featured": false,
    "views_count": 5,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "name": "Amsterdam",
        "country_id": "077c1975-aec5-48fb-bcb3-1ba5e7e081ce",
        "google_maps_id": null,
        "state": null,
        "latitude": 52.3676,
        "longitude": 4.9041,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "077c1975-aec5-48fb-bcb3-1ba5e7e081ce",
          "name": "Netherlands",
          "code": "NL",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?amsterdam,landmark",
            "id": "ba0fc181-bf5b-47e2-9a61-0dacdedfed45",
            "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
            "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?amsterdam,cityscape",
            "id": "18cd37ac-46ef-4ad6-a429-430110b225b6",
            "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
            "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "075df8d3-1589-47ab-96de-3b40197e7114",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "0824370e-a9ab-4f44-b858-097ad996eab0",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "museums",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "68228bd1-3e0c-451d-ae22-c60d87d89edd",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "b36b01be-8bf2-47a9-b24e-f6cdc1703c3e",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "cycling",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "ef43497c-f2e2-4222-9483-5b2e101e0daa",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "tag": "vibrant",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "day_number": 1,
        "title": "Day 1 in Amsterdam",
        "description": "Explore the best of Amsterdam",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "3adeceb0-f8b9-400c-90d7-3072a5d0814c",
            "itinerary_day_id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Amsterdam",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "664ef5eb-fe6a-44cc-9a58-6c6266770088",
            "itinerary_day_id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Amsterdam",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "97cad38b-00d0-4828-bc38-3729360ce0c0",
            "itinerary_day_id": "2191000d-ecb5-4a48-9ec0-ddcd8a71b7dd",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Amsterdam",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "day_number": 2,
        "title": "Day 2 in Amsterdam",
        "description": "Explore the best of Amsterdam",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "08346b43-72c2-4988-a368-2e60a81c81dc",
            "itinerary_day_id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Amsterdam",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "26c0fe78-6d62-413e-9e92-39a9e63771c0",
            "itinerary_day_id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Amsterdam",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "95223a4e-567c-4fba-a078-671ed84f0a66",
            "itinerary_day_id": "76543fe7-34be-47dc-921c-f2d19a6ec29c",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Amsterdam",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "a6944a55-772d-4600-a942-7ee18df09624",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
        "day_number": 3,
        "title": "Day 3 in Amsterdam",
        "description": "Explore the best of Amsterdam",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "bf388e5f-0532-4ceb-bc14-10755f039a62",
            "itinerary_day_id": "a6944a55-772d-4600-a942-7ee18df09624",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Amsterdam",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ce8083a1-d14b-41d0-b0bc-ff52e9ca1223",
            "itinerary_day_id": "a6944a55-772d-4600-a942-7ee18df09624",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Amsterdam",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d216e6b5-2c37-449e-8e90-5aaca7dfa053",
            "itinerary_day_id": "a6944a55-772d-4600-a942-7ee18df09624",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Amsterdam",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d8f22762-57d9-41b4-b606-158320ac34de",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "place_photo_id": null,
        "city_photo_id": "18cd37ac-46ef-4ad6-a429-430110b225b6",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?amsterdam,cityscape",
          "id": "18cd37ac-46ef-4ad6-a429-430110b225b6",
          "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
          "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "213cfe0e-f36a-4191-a758-f527c2779fbe",
        "trip_id": "c5a4e4ff-5037-48af-995f-72a22061e0cc",
        "place_photo_id": null,
        "city_photo_id": "ba0fc181-bf5b-47e2-9a61-0dacdedfed45",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?amsterdam,landmark",
          "id": "ba0fc181-bf5b-47e2-9a61-0dacdedfed45",
          "city_id": "d36cbe92-2225-4ff2-b2b1-61700583b156",
          "google_photo_reference": "placeholder_d36cbe92-2225-4ff2-b2b1-61700583b156_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
    "title": "Bangkok Street Food and Temples",
    "description": "A sensory journey through Thailand's vibrant capital.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 13.7563,
    "destination_lng": 100.5018,
    "is_public": true,
    "is_featured": false,
    "views_count": 22,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "name": "Bangkok",
        "country_id": "d7571cbd-2748-44e3-883e-f4a72ed84e3e",
        "google_maps_id": null,
        "state": null,
        "latitude": 13.7563,
        "longitude": 100.5018,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "d7571cbd-2748-44e3-883e-f4a72ed84e3e",
          "name": "Thailand",
          "code": "TH",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?bangkok,landmark",
            "id": "6848f8fc-54a9-4c6c-8df6-9d291c477d05",
            "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
            "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?bangkok,cityscape",
            "id": "82c1efef-fb4b-44a8-b470-dfb8e9c8da21",
            "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
            "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "0ffa270a-0d14-44f4-9ed9-21cbc418f81c",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "markets",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "7a10e75b-8020-4aae-b278-59ecc5e642a8",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "temples",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "bb87c7f0-d698-43ff-9ad7-8a8d82108676",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "bdaa7ad8-0eaa-4dc6-ac13-cb0e90c1532f",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "c7961ec0-703a-4ae1-b2c6-2368a14249f8",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "tag": "adventure",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "day_number": 1,
        "title": "Day 1 in Bangkok",
        "description": "Explore the best of Bangkok",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "d4b455b6-199a-4766-8f81-0699bf66d182",
            "itinerary_day_id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Bangkok",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f0cd151b-3954-412c-b488-587be0a100e0",
            "itinerary_day_id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Bangkok",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f563f8e9-4dbf-4dc6-b3db-3a0a1f166d4e",
            "itinerary_day_id": "6a74b7aa-6eb7-4b5c-9b86-b9ddb7f8d3ea",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Bangkok",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "day_number": 2,
        "title": "Day 2 in Bangkok",
        "description": "Explore the best of Bangkok",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "39d60a9a-840f-47a0-97be-35c0fffcf51d",
            "itinerary_day_id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Bangkok",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "db3bf6ee-ba9e-40fa-a459-69c508c41949",
            "itinerary_day_id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Bangkok",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e249a9a2-5cdc-44d6-9d39-5196a1d04ac9",
            "itinerary_day_id": "c06344c2-73bd-4750-92ae-94bd742bdfd7",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Bangkok",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
        "day_number": 3,
        "title": "Day 3 in Bangkok",
        "description": "Explore the best of Bangkok",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "42d7a12f-99eb-45c0-b16f-88c78d5d23e4",
            "itinerary_day_id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Bangkok",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "c3cc0577-a8fa-4ce2-82df-3eb90863bc50",
            "itinerary_day_id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Bangkok",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ca9d9242-ecb0-4431-ba2c-c14c53fc7263",
            "itinerary_day_id": "e69b215f-98f1-4a6f-8807-e96cb2eefe34",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Bangkok",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d5277a70-2776-4b0f-a03e-da859082b7bb",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "place_photo_id": null,
        "city_photo_id": "82c1efef-fb4b-44a8-b470-dfb8e9c8da21",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?bangkok,cityscape",
          "id": "82c1efef-fb4b-44a8-b470-dfb8e9c8da21",
          "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
          "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "a5c62eae-7c06-4fc2-bd30-4c89ca6b197b",
        "trip_id": "6bdbc7ae-b4e9-40e7-b31f-d3452291aa2f",
        "place_photo_id": null,
        "city_photo_id": "6848f8fc-54a9-4c6c-8df6-9d291c477d05",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?bangkok,landmark",
          "id": "6848f8fc-54a9-4c6c-8df6-9d291c477d05",
          "city_id": "c5786673-32b4-40b6-9f2a-a87f02d85bdd",
          "google_photo_reference": "placeholder_c5786673-32b4-40b6-9f2a-a87f02d85bdd_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
    "title": "Sydney's Beaches and Opera House",
    "description": "Iconic landmarks and stunning coastal beauty.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": -33.8688,
    "destination_lng": 151.2093,
    "is_public": true,
    "is_featured": false,
    "views_count": 9,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "name": "Sydney",
        "country_id": "d84bda87-87e5-46ec-9837-733411d50018",
        "google_maps_id": null,
        "state": null,
        "latitude": -33.8688,
        "longitude": 151.2093,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "d84bda87-87e5-46ec-9837-733411d50018",
          "name": "Australia",
          "code": "AU",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?sydney,landmark",
            "id": "833a355a-e0f2-4068-b113-adc46b8fd57b",
            "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
            "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?sydney,cityscape",
            "id": "c289951b-466e-4879-8a54-9383d609df93",
            "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
            "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "4002b4fe-b54b-4397-969c-c8c3ff4fc5a3",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "beach",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "8a46eaa8-f807-4137-a4bb-230e33eece77",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "photography",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "a5d64cb7-d8fd-4b6f-a80e-74a649613425",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "nature",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "ab302ed6-d2ec-4de3-98f7-bc8c53f8dfff",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "urban",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "f2688820-50d0-471a-8b27-a6c125cfc5d1",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "day_number": 1,
        "title": "Day 1 in Sydney",
        "description": "Explore the best of Sydney",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "25415a9c-5a18-4104-90c3-a9ae6f535fe7",
            "itinerary_day_id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Sydney",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d9a3150c-02d1-4911-807f-645e81ae6a80",
            "itinerary_day_id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Sydney",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ef13134b-8719-4378-9bfa-d1eb006825a5",
            "itinerary_day_id": "c56ed047-c39c-4826-930e-14cb0bc4689b",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Sydney",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "day_number": 2,
        "title": "Day 2 in Sydney",
        "description": "Explore the best of Sydney",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "8ee2c2ea-7f36-48be-a71b-ddb87d088325",
            "itinerary_day_id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Sydney",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "a72dccb2-7ef1-469b-ae13-235d52183b9a",
            "itinerary_day_id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Sydney",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e01e2840-aca7-4931-a74d-b8246bb99cbc",
            "itinerary_day_id": "ff0d3f7d-b74a-4447-b83e-d68b9fbdd270",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Sydney",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
        "day_number": 3,
        "title": "Day 3 in Sydney",
        "description": "Explore the best of Sydney",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "0195ac29-6d4d-4c26-b7e5-677f65b813e9",
            "itinerary_day_id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Sydney",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "34e89289-1aff-41fc-bf67-2e68621c853c",
            "itinerary_day_id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Sydney",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "3c9145eb-8347-4d1e-961b-6085218ef57b",
            "itinerary_day_id": "3e515148-1735-4ae1-8e92-7ea6260cc2f1",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Sydney",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d62650a5-df9b-487d-9957-5c7288fe2a33",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "place_photo_id": null,
        "city_photo_id": "833a355a-e0f2-4068-b113-adc46b8fd57b",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?sydney,landmark",
          "id": "833a355a-e0f2-4068-b113-adc46b8fd57b",
          "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
          "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "952884e3-22f5-496b-9a0d-b207961c3c63",
        "trip_id": "6c4bd26c-6f71-4b36-97e3-69c236e5b974",
        "place_photo_id": null,
        "city_photo_id": "c289951b-466e-4879-8a54-9383d609df93",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?sydney,cityscape",
          "id": "c289951b-466e-4879-8a54-9383d609df93",
          "city_id": "124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb",
          "google_photo_reference": "placeholder_124a5d3c-f4d6-4c47-9ca0-46a20f04b2eb_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "7f6623b3-0c03-400a-a08b-2b4067917962",
    "title": "A Magical Weekend in Paris",
    "description": "Experience the romance and beauty of Paris in just 3 days.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 48.856614,
    "destination_lng": 2.3522219,
    "is_public": true,
    "is_featured": true,
    "views_count": 8,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "name": "Paris",
        "country_id": "cacb0bb2-dede-4564-aeaa-6d02a2a9b819",
        "google_maps_id": null,
        "state": null,
        "latitude": 48.856614,
        "longitude": 2.3522219,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:10:59.000Z",
        "updated_at": "2025-12-27T15:10:59.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "cacb0bb2-dede-4564-aeaa-6d02a2a9b819",
          "name": "France",
          "code": "FR",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T01:51:14.000Z",
          "updated_at": "2025-12-27T01:51:14.000Z",
          "deleted_at": null
        },
        "photos": []
      }
    ],
    "tags": [
      {
        "id": "43cb902f-216d-4b8a-91b5-26424589e809",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "photography",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "508eec52-6952-43cc-9093-005f010f2cfd",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "romantic",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "623ddcc5-8c3d-42fe-8192-06719e7ba869",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "bddfa0da-7563-436e-9f88-1f8c44d8fe9f",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "c18133fa-3b15-4f28-b439-c5502d1fd489",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "tag": "cultural",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "city_id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "day_number": 1,
        "title": "Day 1 in Paris",
        "description": "Explore the best of Paris",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "098527fe-2636-4400-b0ad-305f26c78181",
            "itinerary_day_id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Paris",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "27fba227-174f-4aa7-9dce-217bd6bb54e7",
            "itinerary_day_id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Paris",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "b5fc2242-d28b-43af-a079-2f18aff2bffd",
            "itinerary_day_id": "7768611a-8016-4ebf-87b0-6a4e8e573afe",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Paris",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "city_id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "day_number": 2,
        "title": "Day 2 in Paris",
        "description": "Explore the best of Paris",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4bc38b25-fff8-4463-8d8d-84887589f0e0",
            "itinerary_day_id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Paris",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "7c9bad74-6b42-41e6-bebc-f979979d0ce8",
            "itinerary_day_id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Paris",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "aa69b22a-b711-44b8-a98e-d43e70ae5648",
            "itinerary_day_id": "1e32c3bc-388b-49ad-a0f5-84c88d32ff62",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Paris",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "dc235f13-0618-4dff-8763-5e3805705104",
        "trip_id": "7f6623b3-0c03-400a-a08b-2b4067917962",
        "city_id": "fec6b777-7cc3-4037-9399-bc969e8a314e",
        "day_number": 3,
        "title": "Day 3 in Paris",
        "description": "Explore the best of Paris",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "d81c5183-c41c-411e-a18a-589c0e7574c8",
            "itinerary_day_id": "dc235f13-0618-4dff-8763-5e3805705104",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Paris",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e5bb8eb1-6dcf-4c87-a43d-ab46208a6347",
            "itinerary_day_id": "dc235f13-0618-4dff-8763-5e3805705104",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Paris",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "e729484a-a45e-4f4c-8290-34d70a82145f",
            "itinerary_day_id": "dc235f13-0618-4dff-8763-5e3805705104",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Paris",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": []
  },
  {
    "id": "8084c0aa-4d60-45f5-86cc-991522867e84",
    "title": "Luxury and Desert in Dubai",
    "description": "Experience ultra-modern architecture and Arabian traditions.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 25.2048,
    "destination_lng": 55.2708,
    "is_public": true,
    "is_featured": false,
    "views_count": 72,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "name": "Dubai",
        "country_id": "d02531e5-a17e-45df-8e29-3e34871a82ff",
        "google_maps_id": null,
        "state": null,
        "latitude": 25.2048,
        "longitude": 55.2708,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "d02531e5-a17e-45df-8e29-3e34871a82ff",
          "name": "United Arab Emirates",
          "code": "AE",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T10:35:59.000Z",
          "updated_at": "2025-12-27T10:35:59.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?dubai,landmark",
            "id": "fe2eb6e0-1d91-4b04-ba44-dbd36febdee3",
            "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
            "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?dubai,cityscape",
            "id": "9d347b85-cc44-470f-a870-a48226a2117a",
            "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
            "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "3769d893-9e2d-406e-b970-0e4fce7719b6",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "shopping",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "3d535837-4227-4f4e-848c-311fe14ed784",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "adventure",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "41cda9e1-3c93-4131-9f1c-69fdd9904324",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "desert",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "d33928ac-b2e9-440d-a4f2-65a220f5ee7d",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "modern",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "fb0422e3-d2f0-4663-85ba-d25b1f5779eb",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "tag": "luxury",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "day_number": 1,
        "title": "Day 1 in Dubai",
        "description": "Explore the best of Dubai",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "26ae1dc5-a284-4dd0-81e9-0cd2e03ad885",
            "itinerary_day_id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Dubai",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "b989ec93-aad8-43c9-81e7-379f069da21f",
            "itinerary_day_id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Dubai",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d97f0eba-910d-4490-b985-ba6434c4e7c5",
            "itinerary_day_id": "2e5fe01c-d6a1-4844-8228-1032d852c8a6",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Dubai",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "day_number": 2,
        "title": "Day 2 in Dubai",
        "description": "Explore the best of Dubai",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "68d9a4d9-9804-4a96-bc05-f8fb6f96c2c3",
            "itinerary_day_id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Dubai",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "773816ae-f5b5-4855-a76a-9a7d3bbb3474",
            "itinerary_day_id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Dubai",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "d97077a6-4b02-44bb-a1f7-64f80e240ce0",
            "itinerary_day_id": "f091a7b1-b772-48e6-bbbf-85ccff55cd8c",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Dubai",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
        "day_number": 3,
        "title": "Day 3 in Dubai",
        "description": "Explore the best of Dubai",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "23b4da93-576e-4fbc-8182-be3063cca2c6",
            "itinerary_day_id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Dubai",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "2d7a4962-50e4-4b87-9016-27be8194bbc5",
            "itinerary_day_id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Dubai",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "38d8dba2-5bd0-4a6d-9576-38390be5335c",
            "itinerary_day_id": "e1172c95-fa82-48da-a61c-e5cfca787d7c",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Dubai",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "89eba754-c18e-42ac-9d1f-e8d83de64d77",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "place_photo_id": null,
        "city_photo_id": "fe2eb6e0-1d91-4b04-ba44-dbd36febdee3",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?dubai,landmark",
          "id": "fe2eb6e0-1d91-4b04-ba44-dbd36febdee3",
          "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
          "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "06954c1e-89e8-4d24-ac08-903854350721",
        "trip_id": "8084c0aa-4d60-45f5-86cc-991522867e84",
        "place_photo_id": null,
        "city_photo_id": "9d347b85-cc44-470f-a870-a48226a2117a",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?dubai,cityscape",
          "id": "9d347b85-cc44-470f-a870-a48226a2117a",
          "city_id": "4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3",
          "google_photo_reference": "placeholder_4d2c33c3-dd32-4136-bcbb-0dbadd8b07d3_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
    "title": "Barcelona's Art and Architecture",
    "description": "Explore Gaudí's masterpieces and Mediterranean beaches.",
    "duration": "3 days",
    "budget": "$1500-2500",
    "transportation": "Public Transport, Walking",
    "accommodation": "Hotel",
    "best_time_to_visit": "Year-round",
    "difficulty_level": "Easy",
    "trip_type": "Cultural & Sightseeing",
    "author_id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
    "destination_lat": 41.3874,
    "destination_lng": 2.1686,
    "is_public": true,
    "is_featured": false,
    "views_count": 35,
    "is_draft": false,
    "created_at": "2025-12-27T15:11:23.000Z",
    "updated_at": "2025-12-27T15:11:23.000Z",
    "deleted_at": null,
    "author": {
      "id": "31e1969d-cf9f-4c09-98a9-96456a596d22",
      "email": "walvee@walvee.com",
      "full_name": "Walvee",
      "preferred_name": "Walvee",
      "photo_url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png",
      "bio": "Your AI-powered travel companion. Discover the world with personalized trip recommendations."
    },
    "cities": [
      {
        "id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "name": "Barcelona",
        "country_id": "9e0bf162-3dd5-4be0-bfd3-d03b1d98cd40",
        "google_maps_id": null,
        "state": null,
        "latitude": 41.3874,
        "longitude": 2.1686,
        "timezone": null,
        "population": null,
        "created_at": "2025-12-27T15:11:23.000Z",
        "updated_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "9e0bf162-3dd5-4be0-bfd3-d03b1d98cd40",
          "name": "Spain",
          "code": "ES",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T15:11:23.000Z",
          "updated_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "https://source.unsplash.com/800x600/?barcelona,landmark",
            "id": "18d5cc26-20aa-4dd4-8632-20c993b410fa",
            "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
            "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_1",
            "attribution": null,
            "photo_order": 1,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "url": "https://source.unsplash.com/800x600/?barcelona,cityscape",
            "id": "e618b041-9bbd-43db-a0a4-66dc5e023e9f",
            "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
            "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_2",
            "attribution": null,
            "photo_order": 2,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "1a964e2f-6e92-4aba-9e75-24f0e3415cce",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "art",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "23e67f98-b903-4837-9487-385b42f0b4d0",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "architecture",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "82eed34a-20ec-4b35-87f9-b6d79c20c0da",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "food",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "849ebdad-8284-4b93-a3e9-c6b7c6b30a55",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "vibrant",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      },
      {
        "id": "c8ccdb08-b9aa-4a32-9b57-e0b49c641812",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "tag": "beach",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null
      }
    ],
    "places": [],
    "itineraryDays": [
      {
        "id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "day_number": 1,
        "title": "Day 1 in Barcelona",
        "description": "Explore the best of Barcelona",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "2a435d75-cb5b-425a-9ca9-67da7567f744",
            "itinerary_day_id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
            "time": "09:00",
            "name": "Morning Activity - Day 1",
            "location": "Barcelona",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "426043a4-3282-42c2-9b04-b7951bd7755a",
            "itinerary_day_id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
            "time": "13:00",
            "name": "Afternoon Activity - Day 1",
            "location": "Barcelona",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "c8eb47b8-4b31-46f0-8957-8e3ca8627013",
            "itinerary_day_id": "9e0a161a-95a2-4b1e-90f8-e69ebf5044c6",
            "time": "18:00",
            "name": "Evening Activity - Day 1",
            "location": "Barcelona",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "4b9a1034-9aca-434e-8649-7e4320846d55",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "day_number": 2,
        "title": "Day 2 in Barcelona",
        "description": "Explore the best of Barcelona",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4643c0ac-ea3a-4439-91b4-b13e8341a666",
            "itinerary_day_id": "4b9a1034-9aca-434e-8649-7e4320846d55",
            "time": "13:00",
            "name": "Afternoon Activity - Day 2",
            "location": "Barcelona",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "4b9dd3a7-83f2-4ad1-9a22-7a0fa4ba6b81",
            "itinerary_day_id": "4b9a1034-9aca-434e-8649-7e4320846d55",
            "time": "18:00",
            "name": "Evening Activity - Day 2",
            "location": "Barcelona",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "f2e94f11-e49d-4dc6-9671-1dda917b266f",
            "itinerary_day_id": "4b9a1034-9aca-434e-8649-7e4320846d55",
            "time": "09:00",
            "name": "Morning Activity - Day 2",
            "location": "Barcelona",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
        "day_number": 3,
        "title": "Day 3 in Barcelona",
        "description": "Explore the best of Barcelona",
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "35973ce3-8411-4b44-8973-be615d44597b",
            "itinerary_day_id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
            "time": "09:00",
            "name": "Morning Activity - Day 3",
            "location": "Barcelona",
            "description": "Start your day with local experiences",
            "activity_order": 1,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "6a5f772b-ffcb-4ec2-8945-68e618621bb0",
            "itinerary_day_id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
            "time": "13:00",
            "name": "Afternoon Activity - Day 3",
            "location": "Barcelona",
            "description": "Continue exploring",
            "activity_order": 2,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          },
          {
            "id": "ec8a0f8a-485e-45c0-93ee-2f7d12f51a49",
            "itinerary_day_id": "194d5e91-55d7-4b9c-bd95-b96bc587e3ff",
            "time": "18:00",
            "name": "Evening Activity - Day 3",
            "location": "Barcelona",
            "description": "End your day with local cuisine",
            "activity_order": 3,
            "place_id": null,
            "created_at": "2025-12-27T15:11:23.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "f04c57cb-fdde-4691-bff0-c61f54122e13",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "place_photo_id": null,
        "city_photo_id": "e618b041-9bbd-43db-a0a4-66dc5e023e9f",
        "image_order": 1,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?barcelona,cityscape",
          "id": "e618b041-9bbd-43db-a0a4-66dc5e023e9f",
          "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
          "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_2",
          "attribution": null,
          "photo_order": 2,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "748b1701-4f0c-4c69-8c41-07b3f410c8ba",
        "trip_id": "cfa54004-d496-4858-a05a-2ac3c17d4e0b",
        "place_photo_id": null,
        "city_photo_id": "18d5cc26-20aa-4dd4-8632-20c993b410fa",
        "image_order": 0,
        "created_at": "2025-12-27T15:11:23.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "https://source.unsplash.com/800x600/?barcelona,landmark",
          "id": "18d5cc26-20aa-4dd4-8632-20c993b410fa",
          "city_id": "bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a",
          "google_photo_reference": "placeholder_bb6352a6-0a5d-4f73-86ec-b3c2cbc47c4a_1",
          "attribution": null,
          "photo_order": 1,
          "created_at": "2025-12-27T15:11:23.000Z",
          "deleted_at": null
        }
      }
    ]
  }
];

    console.log('Rolling back seeded trips...');

    // Collect all IDs for deletion
    const tripIds = tripsData.map(t => t.id);
    const itineraryDayIds = [];
    const activityIds = [];
    const tripPlaceIds = [];
    const tripTagIds = [];
    const tripImageIds = [];
    const placeIds = [];
    const placePhotoIds = [];
    const cityIds = [];
    const cityPhotoIds = [];
    const countryIds = [];

    // Collect IDs from trip data
    for (const trip of tripsData) {
      // Collect itinerary day and activity IDs
      if (trip.itineraryDays) {
        for (const day of trip.itineraryDays) {
          itineraryDayIds.push(day.id);
          if (day.activities) {
            activityIds.push(...day.activities.map(a => a.id));
          }
        }
      }

      // Collect trip place IDs
      if (trip.places) {
        tripPlaceIds.push(...trip.places.map(tp => tp.id));
        for (const tp of trip.places) {
          if (tp.place) {
            placeIds.push(tp.place.id);
            if (tp.place.photos) {
              placePhotoIds.push(...tp.place.photos.map(p => p.id));
            }
          }
        }
      }

      // Collect trip tag IDs
      if (trip.tags) {
        tripTagIds.push(...trip.tags.map(t => t.id));
      }

      // Collect trip image IDs
      if (trip.images) {
        tripImageIds.push(...trip.images.map(i => i.id));
      }

      // Collect city and country IDs
      if (trip.cities) {
        for (const city of trip.cities) {
          cityIds.push(city.id);
          if (city.photos) {
            cityPhotoIds.push(...city.photos.map(p => p.id));
          }
          if (city.country) {
            countryIds.push(city.country.id);
          }
        }
      }
    }

    // Delete in reverse order of creation (respecting foreign key constraints)
    console.log(`Deleting ${tripImageIds.length} trip images...`);
    if (tripImageIds.length > 0) {
      await queryInterface.bulkDelete('trip_images', { id: tripImageIds });
    }

    console.log(`Deleting ${activityIds.length} itinerary activities...`);
    if (activityIds.length > 0) {
      await queryInterface.bulkDelete('trip_itinerary_activities', { id: activityIds });
    }

    console.log(`Deleting ${itineraryDayIds.length} itinerary days...`);
    if (itineraryDayIds.length > 0) {
      await queryInterface.bulkDelete('trip_itinerary_days', { id: itineraryDayIds });
    }

    console.log(`Deleting ${tripPlaceIds.length} trip places...`);
    if (tripPlaceIds.length > 0) {
      await queryInterface.bulkDelete('trip_places', { id: tripPlaceIds });
    }

    console.log(`Deleting ${tripTagIds.length} trip tags...`);
    if (tripTagIds.length > 0) {
      await queryInterface.bulkDelete('trip_tags', { id: tripTagIds });
    }

    console.log(`Deleting trip-city associations...`);
    if (tripIds.length > 0) {
      await queryInterface.bulkDelete('trip_cities', { trip_id: tripIds });
    }

    console.log(`Deleting ${tripIds.length} trips...`);
    if (tripIds.length > 0) {
      await queryInterface.bulkDelete('trips', { id: tripIds });
    }

    console.log(`Deleting ${placePhotoIds.length} place photos...`);
    if (placePhotoIds.length > 0) {
      await queryInterface.bulkDelete('place_photos', { id: placePhotoIds });
    }

    console.log(`Deleting ${placeIds.length} places...`);
    if (placeIds.length > 0) {
      await queryInterface.bulkDelete('places', { id: placeIds });
    }

    console.log(`Deleting ${cityPhotoIds.length} city photos...`);
    if (cityPhotoIds.length > 0) {
      await queryInterface.bulkDelete('city_photos', { id: cityPhotoIds });
    }

    console.log(`Deleting ${cityIds.length} cities...`);
    if (cityIds.length > 0) {
      await queryInterface.bulkDelete('cities', { id: cityIds });
    }

    console.log(`Deleting ${countryIds.length} countries...`);
    if (countryIds.length > 0) {
      await queryInterface.bulkDelete('countries', { id: countryIds });
    }

    console.log('Rollback completed successfully!');
  }
};
