const { sequelize, initModels } = require("../src/models/sequelize");
const {
  Trip,
  User,
  City,
  Country,
  TripCity,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripImage,
  Place,
  PlacePhoto,
  CityPhoto,
} = require("../src/models/sequelize");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

// Trip templates with different destinations
const tripTemplates = [
  {
    city: "Paris",
    country: "France",
    countryCode: "FR",
    title: "A Magical Weekend in Paris",
    description: "Experience the romance and beauty of Paris in just 3 days.",
    tags: ["romantic", "cultural", "architecture", "food", "photography"],
    latitude: 48.856614,
    longitude: 2.3522219,
  },
  {
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    title: "Tokyo Adventure: Modern Meets Traditional",
    description: "Discover the perfect blend of ancient temples and futuristic technology.",
    tags: ["cultural", "food", "technology", "urban", "temples"],
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    title: "Barcelona's Art and Architecture",
    description: "Explore Gaudí's masterpieces and Mediterranean beaches.",
    tags: ["architecture", "beach", "art", "food", "vibrant"],
    latitude: 41.3874,
    longitude: 2.1686,
  },
  {
    city: "New York",
    country: "United States",
    countryCode: "US",
    title: "The Big Apple Experience",
    description: "From Central Park to Times Square, experience NYC's energy.",
    tags: ["urban", "museums", "food", "shopping", "skyline"],
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    title: "Ancient Rome and Italian Delights",
    description: "Walk through history in the Eternal City.",
    tags: ["history", "architecture", "food", "cultural", "romantic"],
    latitude: 41.9028,
    longitude: 12.4964,
  },
  {
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    title: "Bangkok Street Food and Temples",
    description: "A sensory journey through Thailand's vibrant capital.",
    tags: ["food", "temples", "markets", "cultural", "adventure"],
    latitude: 13.7563,
    longitude: 100.5018,
  },
  {
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    title: "London's Royal Heritage",
    description: "Explore British history, culture, and modern attractions.",
    tags: ["history", "museums", "cultural", "royal", "urban"],
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    title: "Luxury and Desert in Dubai",
    description: "Experience ultra-modern architecture and Arabian traditions.",
    tags: ["luxury", "modern", "desert", "shopping", "adventure"],
    latitude: 25.2048,
    longitude: 55.2708,
  },
  {
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    title: "Sydney's Beaches and Opera House",
    description: "Iconic landmarks and stunning coastal beauty.",
    tags: ["beach", "urban", "nature", "cultural", "photography"],
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    title: "Canals and Culture in Amsterdam",
    description: "Bike through charming streets and world-class museums.",
    tags: ["cultural", "museums", "cycling", "architecture", "vibrant"],
    latitude: 52.3676,
    longitude: 4.9041,
  },
];

async function createWalveeTrips() {
  initModels();

  try {
    console.log("[Create] Finding walvee user...");

    // Find walvee user
    const walveeUser = await User.findOne({
      where: {
        email: { [Op.like]: "%walvee%" },
      },
    });

    if (!walveeUser) {
      console.error("[Create] Walvee user not found!");
      process.exit(1);
    }

    console.log(`[Create] Found walvee user: ${walveeUser.email}`);
    console.log(`[Create] Creating ${tripTemplates.length} trips...\n`);

    // Find or create Paris, France
    console.log("[Create] Setting up Paris, France...");

    let france = await Country.findOne({
      where: { code: "FR" },
    });

    if (!france) {
      france = await Country.create({
        id: uuidv4(),
        name: "France",
        code: "FR",
        continent: "Europe",
        flag_emoji: "🇫🇷",
      });
      console.log("[Create] Created France country");
    }

    let paris = await City.findOne({
      where: { name: "Paris", country_id: france.id },
    });

    if (!paris) {
      paris = await City.create({
        id: uuidv4(),
        name: "Paris",
        country_id: france.id,
        google_maps_id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
        state: "Île-de-France",
        latitude: 48.856614,
        longitude: 2.3522219,
        timezone: "Europe/Paris",
        population: 2161000,
      });
      console.log("[Create] Created Paris city");
    }

    // Create city photos for Paris
    const parisPhotos = await CityPhoto.findAll({
      where: { city_id: paris.id },
    });

    if (parisPhotos.length === 0) {
      await CityPhoto.bulkCreate([
        {
          id: uuidv4(),
          city_id: paris.id,
          url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
          photo_order: 1,
        },
        {
          id: uuidv4(),
          city_id: paris.id,
          url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",
          photo_order: 2,
        },
      ]);
      console.log("[Create] Created Paris city photos");
    }

    // Create the trip
    console.log("[Create] Creating trip...");

    const trip = await Trip.create({
      id: uuidv4(),
      author_id: walveeUser.id,
      title: "A Magical Weekend in Paris",
      description:
        "Experience the romance and beauty of Paris in just 3 days. From the iconic Eiffel Tower to charming cafés in Montmartre, this itinerary covers all the must-see attractions while leaving time to soak in the Parisian atmosphere.",
      duration: "3 days",
      budget: "$1500-2000",
      transportation: "Metro, Walking",
      accommodation: "Hotel in Le Marais",
      best_time_to_visit: "Spring (April-June) or Fall (September-November)",
      difficulty_level: "Easy",
      trip_type: "Cultural & Sightseeing",
      is_public: true,
      is_featured: false,
      is_draft: false,
      views_count: 0,
    });

    console.log(`[Create] Created trip: ${trip.title}`);

    // Link trip to Paris
    await TripCity.create({
      id: uuidv4(),
      trip_id: trip.id,
      city_id: paris.id,
      city_order: 0,
    });

    // Add tags
    const tags = ["romantic", "cultural", "architecture", "food", "photography"];
    for (const tag of tags) {
      await TripTag.create({
        id: uuidv4(),
        trip_id: trip.id,
        tag: tag,
      });
    }
    console.log("[Create] Added tags");

    // Create places
    console.log("[Create] Creating places...");

    const eiffelTower = await Place.findOne({
      where: { name: "Eiffel Tower" },
    });

    let eiffelPlace = eiffelTower;
    if (!eiffelPlace) {
      eiffelPlace = await Place.create({
        id: uuidv4(),
        google_place_id: "ChIJLU7jZClu5kcR4PcOOO6p3I0",
        name: "Eiffel Tower",
        address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
        city_id: paris.id,
        latitude: 48.8583701,
        longitude: 2.2944813,
        rating: 4.6,
        user_ratings_total: 250000,
        price_level: 2,
        types: ["tourist_attraction", "point_of_interest"],
      });

      await PlacePhoto.create({
        id: uuidv4(),
        place_id: eiffelPlace.id,
        url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",
        photo_order: 1,
      });
    }

    const louvre = await Place.findOne({
      where: { name: "Louvre Museum" },
    });

    let louvrePlace = louvre;
    if (!louvrePlace) {
      louvrePlace = await Place.create({
        id: uuidv4(),
        google_place_id: "ChIJD3uTd9hx5kcR1IQvGfr8dbk",
        name: "Louvre Museum",
        address: "Rue de Rivoli, 75001 Paris, France",
        city_id: paris.id,
        latitude: 48.8606111,
        longitude: 2.337644,
        rating: 4.7,
        user_ratings_total: 180000,
        price_level: 2,
        types: ["museum", "tourist_attraction", "point_of_interest"],
      });

      await PlacePhoto.create({
        id: uuidv4(),
        place_id: louvrePlace.id,
        url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
        photo_order: 1,
      });
    }

    // Add places to trip
    await TripPlace.create({
      id: uuidv4(),
      trip_id: trip.id,
      place_id: eiffelPlace.id,
      name: eiffelPlace.name,
      address: eiffelPlace.address,
      rating: eiffelPlace.rating,
      price_level: eiffelPlace.price_level,
      types: eiffelPlace.types,
      description: "The iconic symbol of Paris, offering stunning city views",
    });

    await TripPlace.create({
      id: uuidv4(),
      trip_id: trip.id,
      place_id: louvrePlace.id,
      name: louvrePlace.name,
      address: louvrePlace.address,
      rating: louvrePlace.rating,
      price_level: louvrePlace.price_level,
      types: louvrePlace.types,
      description: "World's largest art museum, home to the Mona Lisa",
    });

    console.log("[Create] Added places to trip");

    // Create itinerary
    console.log("[Create] Creating itinerary...");

    // Day 1
    const day1 = await TripItineraryDay.create({
      id: uuidv4(),
      trip_id: trip.id,
      city_id: paris.id,
      day_number: 1,
      title: "Iconic Landmarks",
      description: "Start your Paris adventure with the most famous sights",
    });

    await TripItineraryActivity.bulkCreate([
      {
        id: uuidv4(),
        itinerary_day_id: day1.id,
        time: "09:00",
        name: "Visit Eiffel Tower",
        location: "Eiffel Tower",
        description: "Start early to beat the crowds. Book tickets online in advance.",
        activity_order: 1,
        place_id: eiffelPlace.id,
      },
      {
        id: uuidv4(),
        itinerary_day_id: day1.id,
        time: "13:00",
        name: "Lunch at Café de l'Homme",
        location: "Trocadéro",
        description: "Enjoy lunch with a view of the Eiffel Tower",
        activity_order: 2,
      },
      {
        id: uuidv4(),
        itinerary_day_id: day1.id,
        time: "15:00",
        name: "Seine River Cruise",
        location: "Seine River",
        description: "Relaxing boat tour to see Paris from the water",
        activity_order: 3,
      },
    ]);

    // Day 2
    const day2 = await TripItineraryDay.create({
      id: uuidv4(),
      trip_id: trip.id,
      city_id: paris.id,
      day_number: 2,
      title: "Art & Culture",
      description: "Immerse yourself in world-class art and history",
    });

    await TripItineraryActivity.bulkCreate([
      {
        id: uuidv4(),
        itinerary_day_id: day2.id,
        time: "09:00",
        name: "Louvre Museum",
        location: "Louvre Museum",
        description: "Spend the morning exploring the world's largest art museum",
        activity_order: 1,
        place_id: louvrePlace.id,
      },
      {
        id: uuidv4(),
        itinerary_day_id: day2.id,
        time: "14:00",
        name: "Stroll through Tuileries Garden",
        location: "Jardin des Tuileries",
        description: "Beautiful gardens perfect for a leisurely walk",
        activity_order: 2,
      },
      {
        id: uuidv4(),
        itinerary_day_id: day2.id,
        time: "17:00",
        name: "Explore Le Marais",
        location: "Le Marais",
        description: "Wander through charming streets, boutiques, and cafés",
        activity_order: 3,
      },
    ]);

    // Day 3
    const day3 = await TripItineraryDay.create({
      id: uuidv4(),
      trip_id: trip.id,
      city_id: paris.id,
      day_number: 3,
      title: "Montmartre & Departure",
      description: "End your trip in the artistic heart of Paris",
    });

    await TripItineraryActivity.bulkCreate([
      {
        id: uuidv4(),
        itinerary_day_id: day3.id,
        time: "09:00",
        name: "Sacré-Cœur Basilica",
        location: "Montmartre",
        description: "Visit the stunning white basilica with panoramic views",
        activity_order: 1,
      },
      {
        id: uuidv4(),
        itinerary_day_id: day3.id,
        time: "11:00",
        name: "Explore Montmartre Streets",
        location: "Montmartre",
        description: "Discover artist studios, cafés, and the famous Moulin Rouge",
        activity_order: 2,
      },
      {
        id: uuidv4(),
        itinerary_day_id: day3.id,
        time: "14:00",
        name: "Last-minute Shopping",
        location: "Champs-Élysées",
        description: "Pick up souvenirs along the famous avenue",
        activity_order: 3,
      },
    ]);

    console.log("[Create] Created 3-day itinerary");

    // Add trip images from city photos
    const cityPhotos = await CityPhoto.findAll({
      where: { city_id: paris.id },
      order: [["photo_order", "ASC"]],
    });

    for (let i = 0; i < Math.min(cityPhotos.length, 2); i++) {
      await TripImage.create({
        id: uuidv4(),
        trip_id: trip.id,
        city_photo_id: cityPhotos[i].id,
        image_order: i,
      });
    }

    console.log("[Create] Added trip images");
    console.log(`[Create] ✓ Successfully created trip: ${trip.title} (${trip.id})`);

    process.exit(0);
  } catch (error) {
    console.error("[Create] Error:", error);
    process.exit(1);
  }
}

createWalveeTrip();
