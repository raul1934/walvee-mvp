// DEPRECATED: legacy SQL-based `follows` model removed in favor of Sequelize `user_follow` (Follow) model.
// Keeping a stub to surface clearer errors if old code paths still reference this file.

module.exports = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "Legacy 'follows' model was removed. Use Sequelize Follow model (user_follow) via src/models/sequelize/Follow.js instead."
      );
    },
  }
);
