const { sequelize, initModels } = require("../src/models/sequelize");
const {
  Trip,
  User,
  City,
  Country,
  TripCity,
  TripTag,
  TripItineraryDay,
  TripItineraryActivity,
  TripImage,
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

    let createdCount = 0;

    for (const template of tripTemplates) {
      console.log(`[Create] Creating trip ${createdCount + 1}/10: ${template.title}`);

      // Find or create country
      let country = await Country.findOne({
        where: { code: template.countryCode },
      });

      if (!country) {
        country = await Country.create({
          id: uuidv4(),
          name: template.country,
          code: template.countryCode,
        });
        console.log(`  ✓ Created ${template.country} country`);
      }

      // Find or create city
      let city = await City.findOne({
        where: { name: template.city, country_id: country.id },
      });

      if (!city) {
        city = await City.create({
          id: uuidv4(),
          name: template.city,
          country_id: country.id,
          latitude: template.latitude,
          longitude: template.longitude,
        });
        console.log(`  ✓ Created ${template.city} city`);

        // Create placeholder city photos
        await CityPhoto.bulkCreate([
          {
            id: uuidv4(),
            city_id: city.id,
            google_photo_reference: `placeholder_${city.id}_1`,
            url: `https://source.unsplash.com/800x600/?${template.city.toLowerCase()},landmark`,
            photo_order: 1,
          },
          {
            id: uuidv4(),
            city_id: city.id,
            google_photo_reference: `placeholder_${city.id}_2`,
            url: `https://source.unsplash.com/800x600/?${template.city.toLowerCase()},cityscape`,
            photo_order: 2,
          },
        ]);
      }

      // Create the trip
      const trip = await Trip.create({
        id: uuidv4(),
        author_id: walveeUser.id,
        title: template.title,
        description: template.description,
        duration: "3 days",
        budget: "$1500-2500",
        transportation: "Public Transport, Walking",
        accommodation: "Hotel",
        best_time_to_visit: "Year-round",
        difficulty_level: "Easy",
        trip_type: "Cultural & Sightseeing",
        is_public: true,
        is_featured: createdCount === 0, // Make first trip featured
        is_draft: false,
        views_count: Math.floor(Math.random() * 100),
        destination_lat: template.latitude,
        destination_lng: template.longitude,
      });

      // Link trip to city
      await TripCity.create({
        id: uuidv4(),
        trip_id: trip.id,
        city_id: city.id,
        city_order: 0,
      });

      // Add tags
      for (const tag of template.tags) {
        await TripTag.create({
          id: uuidv4(),
          trip_id: trip.id,
          tag: tag,
        });
      }

      // Create 3-day itinerary
      for (let dayNum = 1; dayNum <= 3; dayNum++) {
        const day = await TripItineraryDay.create({
          id: uuidv4(),
          trip_id: trip.id,
          city_id: city.id,
          day_number: dayNum,
          title: `Day ${dayNum} in ${template.city}`,
          description: `Explore the best of ${template.city}`,
        });

        // Add 3 activities per day
        await TripItineraryActivity.bulkCreate([
          {
            id: uuidv4(),
            itinerary_day_id: day.id,
            time: "09:00",
            name: `Morning Activity - Day ${dayNum}`,
            location: template.city,
            description: "Start your day with local experiences",
            activity_order: 1,
          },
          {
            id: uuidv4(),
            itinerary_day_id: day.id,
            time: "13:00",
            name: `Afternoon Activity - Day ${dayNum}`,
            location: template.city,
            description: "Continue exploring",
            activity_order: 2,
          },
          {
            id: uuidv4(),
            itinerary_day_id: day.id,
            time: "18:00",
            name: `Evening Activity - Day ${dayNum}`,
            location: template.city,
            description: "End your day with local cuisine",
            activity_order: 3,
          },
        ]);
      }

      // Add trip images from city photos
      const cityPhotos = await CityPhoto.findAll({
        where: { city_id: city.id },
        order: [["photo_order", "ASC"]],
        limit: 2,
      });

      for (let i = 0; i < cityPhotos.length; i++) {
        await TripImage.create({
          id: uuidv4(),
          trip_id: trip.id,
          city_photo_id: cityPhotos[i].id,
          image_order: i,
        });
      }

      createdCount++;
      console.log(`  ✓ Trip created: ${trip.title} (${trip.id})\n`);
    }

    console.log(`\n[Create] ✓ Successfully created ${createdCount} trips for ${walveeUser.email}`);
    process.exit(0);
  } catch (error) {
    console.error("[Create] Error:", error);
    process.exit(1);
  }
}

createWalveeTrips();
