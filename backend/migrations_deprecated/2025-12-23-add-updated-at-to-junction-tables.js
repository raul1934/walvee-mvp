module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add updated_at column to junction tables that were missing it
    // Sequelize expects timestamps on all tables by default

    const junctionTables = ['trip_cities', 'trip_places', 'trip_tags'];

    for (const table of junctionTables) {
      try {
        const tableDesc = await queryInterface.describeTable(table);

        if (!tableDesc.updated_at) {
          await queryInterface.addColumn(table, 'updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          });
          console.log(`✓ Added updated_at to ${table}`);
        } else {
          console.log(`✓ ${table} already has updated_at`);
        }
      } catch (err) {
        console.error(`Error updating ${table}: ${err.message}`);
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove updated_at columns from junction tables
    const junctionTables = ['trip_cities', 'trip_places', 'trip_tags'];

    for (const table of junctionTables) {
      try {
        await queryInterface.removeColumn(table, 'updated_at');
      } catch (err) {
        console.error(`Error removing updated_at from ${table}: ${err.message}`);
      }
    }
  },
};
