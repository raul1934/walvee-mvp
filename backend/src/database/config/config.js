require('dotenv').config();
const config = require('../../config/config');

module.exports = {
  development: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.database,
    host: config.database.host,
    port: config.database.port || 3306,
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_meta_v2',
  },
  production: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.database,
    host: config.database.host,
    port: config.database.port || 3306,
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_meta_v2',
  }
};
