const { sequelize, initModels } = require("../src/models/sequelize");
const { User } = require("../src/models/sequelize");
const { Op } = require("sequelize");

async function checkWalveeUser() {
  initModels();

  try {
    // Search for walvee user
    const walveeUser = await User.findOne({
      where: {
        email: {
          [Op.like]: '%walvee%'
        }
      }
    });

    if (walveeUser) {
      console.log("Found walvee user:");
      console.log({
        id: walveeUser.id,
        email: walveeUser.email,
        full_name: walveeUser.full_name,
        preferred_name: walveeUser.preferred_name
      });
    } else {
      console.log("No walvee user found. Searching all users...");
      const allUsers = await User.findAll({
        attributes: ['id', 'email', 'full_name', 'preferred_name'],
        limit: 10
      });
      console.log("Available users:", allUsers.map(u => u.toJSON()));
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkWalveeUser();
