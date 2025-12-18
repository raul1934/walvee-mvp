const { sequelize, Place } = require("../models/sequelize");

/**
 * Add more popular tourist places to match unlinked activities
 */
async function addMorePopularPlaces() {
  try {
    console.log("Adding more popular tourist places to database...\n");

    const morePlaces = [
      // Barcelona
      {
        google_place_id: "ChIJk_s92NyipBIRUMnDG8Kq2Js",
        name: "Basílica de la Sagrada Família",
        address: "C/ de Mallorca, 401, 08013 Barcelona, Spain",
        latitude: 41.403629,
        longitude: 2.174356,
        rating: 4.7,
        user_ratings_total: 280000,
      },
      {
        google_place_id: "ChIJ3_bLWO6ipBIRb4eOGGJaL3M",
        name: "Gothic Quarter",
        address: "Barri Gòtic, Barcelona, Spain",
        latitude: 41.382972,
        longitude: 2.176445,
        rating: 4.6,
        user_ratings_total: 45000,
      },
      // Paris
      {
        google_place_id: "ChIJD3uTd9hx5kcR1IQvGfr8dbk",
        name: "Louvre Museum",
        address: "Rue de Rivoli, 75001 Paris, France",
        latitude: 48.860611,
        longitude: 2.337644,
        rating: 4.7,
        user_ratings_total: 450000,
      },
      {
        google_place_id: "ChIJY_C9sEJu5kcRH_dYCPevMBo",
        name: "Trocadéro Gardens",
        address: "Pl. du Trocadéro et du 11 Novembre, 75016 Paris, France",
        latitude: 48.862083,
        longitude: 2.287384,
        rating: 4.5,
        user_ratings_total: 25000,
      },
      {
        google_place_id: "ChIJk6mfiU9v5kcRwE7cXiD6OBM",
        name: "Tuileries Garden",
        address: "75001 Paris, France",
        latitude: 48.863563,
        longitude: 2.327453,
        rating: 4.6,
        user_ratings_total: 85000,
      },
      // Tokyo
      {
        google_place_id: "ChIJ8T1GpMGOGGARDYGSgpooDWw",
        name: "Sensō-ji Temple",
        address: "2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan",
        latitude: 35.714764,
        longitude: 139.796635,
        rating: 4.5,
        user_ratings_total: 120000,
      },
      {
        google_place_id: "ChIJ63z-PceOGGARGfxKHd8VLj4",
        name: "Nakamise Shopping Street",
        address: "1 Chome-36-3 Asakusa, Taito City, Tokyo 111-0032, Japan",
        latitude: 35.711422,
        longitude: 139.796762,
        rating: 4.3,
        user_ratings_total: 15000,
      },
      {
        google_place_id: "ChIJlZiJkVeLGGARMYLQ0WqPHgQ",
        name: "Akihabara Electric Town",
        address: "Sotokanda, Chiyoda City, Tokyo, Japan",
        latitude: 35.698683,
        longitude: 139.773055,
        rating: 4.3,
        user_ratings_total: 35000,
      },
      {
        google_place_id: "ChIJ8e4xDNWLGGAR39tmgWvOuaY",
        name: "Shibuya Sky",
        address: "2 Chome-24-12 Shibuya, Shibuya City, Tokyo 150-0002, Japan",
        latitude: 35.658034,
        longitude: 139.702687,
        rating: 4.5,
        user_ratings_total: 25000,
      },
      {
        google_place_id: "ChIJ_3W3aH2LGGARy0HmG66fLaE",
        name: "teamLab Borderless",
        address: "1 Chome-3-8 Aomi, Koto City, Tokyo 135-0064, Japan",
        latitude: 35.625846,
        longitude: 139.775441,
        rating: 4.5,
        user_ratings_total: 18000,
      },
      // New York
      {
        google_place_id: "ChIJbcL2u_lYwokR8g6P3MffaSU",
        name: "Brooklyn Bridge",
        address: "Brooklyn Bridge, New York, NY 10038, USA",
        latitude: 40.706086,
        longitude: -73.996864,
        rating: 4.8,
        user_ratings_total: 125000,
      },
      // Dubai
      {
        google_place_id: "ChIJmfNfINhsXz4RZkHsqw3qEWM",
        name: "Burj Al Arab",
        address: "Jumeirah St - Umm Suqeim - Umm Suqeim 3 - Dubai - UAE",
        latitude: 25.141267,
        longitude: 55.185326,
        rating: 4.6,
        user_ratings_total: 95000,
      },
      // Iceland
      {
        google_place_id: "ChIJwZnBc8Lb1kgRmRVoLhKN4vQ",
        name: "Þingvellir National Park",
        address: "806, Iceland",
        latitude: 64.255833,
        longitude: -21.129722,
        rating: 4.8,
        user_ratings_total: 32000,
      },
      {
        google_place_id: "ChIJ-fjwdO7z1kgRxtf_BPqPJPI",
        name: "Geysir",
        address: "Geysir, Iceland",
        latitude: 64.310554,
        longitude: -20.303189,
        rating: 4.6,
        user_ratings_total: 18000,
      },
      // Bali, Indonesia
      {
        google_place_id: "ChIJoQ8Q6NNB0S0RkOYkS7EPkSQ",
        name: "Tegallalang Rice Terrace",
        address: "Jl. Raya Tegallalang, Tegallalang, Bali 80561, Indonesia",
        latitude: -8.433333,
        longitude: 115.283333,
        rating: 4.3,
        user_ratings_total: 42000,
      },
      {
        google_place_id: "ChIJ_xa2RvVB0S0RQx08OgqaKCU",
        name: "Campuhan Ridge Walk",
        address: "Jl. Raya Campuhan, Sayan, Ubud, Bali 80571, Indonesia",
        latitude: -8.507778,
        longitude: 115.256667,
        rating: 4.5,
        user_ratings_total: 15000,
      },
      // Santorini, Greece
      {
        google_place_id: "ChIJZ9JcmqVinxQRlkdFJkJwMpk",
        name: "Fira",
        address: "Fira 847 00, Greece",
        latitude: 36.416667,
        longitude: 25.431944,
        rating: 4.6,
        user_ratings_total: 8500,
      },
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const placeData of morePlaces) {
      // Check if place already exists
      const existing = await Place.findOne({
        where: { google_place_id: placeData.google_place_id },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${placeData.name} (already exists)`);
        skippedCount++;
      } else {
        await Place.create(placeData);
        console.log(`✅ Added: ${placeData.name}`);
        addedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Added: ${addedCount} places`);
    console.log(`  Skipped: ${skippedCount} places (already exist)`);
    console.log(`  Total: ${morePlaces.length} places processed`);
  } catch (error) {
    console.error("Error adding popular places:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addMorePopularPlaces()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = addMorePopularPlaces;
