const { sequelize, Place } = require("../models/sequelize");

/**
 * Add popular tourist places to the database
 */
async function addPopularPlaces() {
  try {
    console.log("Adding popular tourist places to database...\n");

    const popularPlaces = [
      // New York
      {
        google_place_id: "ChIJmQJIxlVYwokRLgeuocVOGVU",
        name: "Times Square",
        address: "Manhattan, NY 10036, USA",
        latitude: 40.758896,
        longitude: -73.98513,
        rating: 4.7,
        user_ratings_total: 25000,
      },
      {
        google_place_id: "ChIJaXQRs6lZwokRY6EFpJnhNNE",
        name: "Empire State Building",
        address: "20 W 34th St., New York, NY 10001, USA",
        latitude: 40.748817,
        longitude: -73.985428,
        rating: 4.7,
        user_ratings_total: 180000,
      },
      // Paris
      {
        google_place_id: "ChIJLU7jZClu5kcR4PcOOO6p3I0",
        name: "Eiffel Tower",
        address: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
        latitude: 48.858844,
        longitude: 2.294351,
        rating: 4.6,
        user_ratings_total: 580000,
      },
      {
        google_place_id: "ChIJJXbje4Fv5kcRfqW1f8KqOqA",
        name: "Musée d'Orsay",
        address: "1 Rue de la Légion d'Honneur, 75007 Paris, France",
        latitude: 48.859995,
        longitude: 2.326561,
        rating: 4.7,
        user_ratings_total: 100000,
      },
      // Barcelona
      {
        google_place_id: "ChIJ4woIlK-ipBIRkG_5KCNuF-k",
        name: "Casa Batlló",
        address: "Passeig de Gràcia, 43, 08007 Barcelona, Spain",
        latitude: 41.391624,
        longitude: 2.164998,
        rating: 4.6,
        user_ratings_total: 95000,
      },
      {
        google_place_id: "ChIJ5TCOcRaYpBIRCmZHTz37sEQ",
        name: "Park Güell",
        address: "08024 Barcelona, Spain",
        latitude: 41.414495,
        longitude: 2.152695,
        rating: 4.6,
        user_ratings_total: 130000,
      },
      // Tokyo
      {
        google_place_id: "ChIJCewJkL2LGGAR3Qmk0vCTGkg",
        name: "Tokyo Skytree",
        address: "1 Chome-1-2 Oshiage, Sumida City, Tokyo 131-8634, Japan",
        latitude: 35.710063,
        longitude: 139.8107,
        rating: 4.4,
        user_ratings_total: 140000,
      },
      {
        google_place_id: "ChIJ51cu8IcbXWARiRtXIothAS4",
        name: "Tokyo Tower",
        address: "4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan",
        latitude: 35.658581,
        longitude: 139.745438,
        rating: 4.3,
        user_ratings_total: 95000,
      },
      // Iceland
      {
        google_place_id: "ChIJrRbnL-9z1kgR-7sLLKxKKWE",
        name: "Gullfoss Waterfall",
        address: "Gullfossi, Iceland",
        latitude: 64.327103,
        longitude: -20.120982,
        rating: 4.8,
        user_ratings_total: 25000,
      },
      // Dubai
      {
        google_place_id: "ChIJzSR2hWZwXz4R7OqJc8jIkHE",
        name: "Dubai Mall",
        address: "Financial Center Rd - Dubai - United Arab Emirates",
        latitude: 25.197525,
        longitude: 55.279383,
        rating: 4.7,
        user_ratings_total: 280000,
      },
      {
        google_place_id: "ChIJE_KqFmluXz4REcXF5XpVPCo",
        name: "Burj Khalifa",
        address: "1 Sheikh Mohammed bin Rashid Blvd - Dubai - United Arab Emirates",
        latitude: 25.197197,
        longitude: 55.274376,
        rating: 4.7,
        user_ratings_total: 180000,
      },
      // Greece
      {
        google_place_id: "ChIJu2VzIlZjnhQRCQ8sWIUFGJw",
        name: "Oia",
        address: "Oia 847 02, Greece",
        latitude: 36.461484,
        longitude: 25.375316,
        rating: 4.7,
        user_ratings_total: 15000,
      },
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const placeData of popularPlaces) {
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
    console.log(`  Total: ${popularPlaces.length} places processed`);
  } catch (error) {
    console.error("Error adding popular places:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addPopularPlaces()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = addPopularPlaces;
