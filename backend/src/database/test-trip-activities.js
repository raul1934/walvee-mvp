const {
  Trip,
  TripItineraryDay,
  TripItineraryActivity,
  Place,
} = require("../models/sequelize");

async function testTripData() {
  try {
    // Find a trip that has activities
    const trip = await Trip.findOne({
      include: [
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              attributes: ["time", "name", "location", "place_id"],
              include: [
                {
                  model: Place,
                  as: "placeDetails",
                  attributes: [
                    "id",
                    "name",
                    "google_place_id",
                    "latitude",
                    "longitude",
                    "rating",
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    if (!trip) {
      console.log("No trips found");
      process.exit(0);
    }

    console.log("Trip: " + trip.title);
    console.log("Days: " + (trip.itineraryDays ? trip.itineraryDays.length : 0));
    console.log("");

    if (trip.itineraryDays && trip.itineraryDays.length > 0) {
      const day = trip.itineraryDays[0];
      console.log("Day 1: " + (day.title || "Untitled"));
      console.log("Activities with place details:");
      console.log("");

      if (day.activities) {
        day.activities.forEach((activity, idx) => {
          console.log(idx + 1 + ". " + activity.name);
          console.log("   Location: " + activity.location);
          if (activity.placeDetails) {
            console.log("   ✅ Has place details!");
            console.log("   Place: " + activity.placeDetails.name);
            console.log(
              "   Coords: " +
                activity.placeDetails.latitude +
                ", " +
                activity.placeDetails.longitude
            );
            console.log("   Rating: " + (activity.placeDetails.rating || "N/A"));
          } else {
            console.log("   ❌ No place details");
          }
          console.log("");
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testTripData();
