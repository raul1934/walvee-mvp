const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("../config/config");
const { User, Follow, Trip, City, Country } = require("../models/sequelize");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

// Configure Google Strategy
if (config.google.clientID && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const fullName = profile.displayName;
          const photoUrl = profile.photos[0]?.value || null;

          let user = await User.findOne({ where: { google_id: googleId } });

          if (!user) {
            user = await User.findOne({ where: { email } });

            if (user) {
              // If the user exists by email, attach google id and only set
              // photo_url from provider when there's no existing photo set.
              const updates = { google_id: googleId };
              if (!user.photo_url && photoUrl) updates.photo_url = photoUrl;
              if (!user.full_name && fullName) updates.full_name = fullName;
              await user.update(updates);
            } else {
              // New user created from Google - safe to set provider photo
              user = await User.create({
                email,
                google_id: googleId,
                full_name: fullName,
                photo_url: photoUrl,
              });
            }
          } else {
            // Existing user found by google_id: update name but do not
            // overwrite an existing photo_url unless it's missing
            const updates = { full_name: fullName };
            if (!user.photo_url && photoUrl) updates.photo_url = photoUrl;
            await user.update(updates);
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Controllers
const initiateGoogleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${config.frontendUrl}/auth/error`);
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.env === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
  })(req, res, next);
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json(buildErrorResponse("UNAUTHORIZED", "No refresh token provided"));
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res
        .status(401)
        .json(
          buildErrorResponse("UNAUTHORIZED", "Invalid or expired refresh token")
        );
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json(buildErrorResponse("UNAUTHORIZED", "User not found"));
    }

    const newToken = generateToken(user);

    res.json(
      buildSuccessResponse({
        token: newToken,
        expiresIn: 604800, // 7 days in seconds
      })
    );
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json(buildSuccessResponse({ message: "Logged out successfully" }));
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Add follower/following counts from user_follow table for accuracy
    const followers_count = await Follow.count({
      where: { followee_id: user.id },
    });
    const following_count = await Follow.count({
      where: { follower_id: user.id },
    });
    const trips_count = await Trip.count({
      where: { author_id: user.id },
    });

    const userObj = user.toJSON();
    // Add dynamic counts
    userObj.followers_count = followers_count;
    userObj.following_count = following_count;
    userObj.trips_count = trips_count;

    // Include nested city object when available for frontend convenience
    if (userObj.city_id) {
      const city = await City.findByPk(userObj.city_id, {
        include: [{ model: Country, as: "country" }],
      });

      if (city) {
        userObj.city = {
          id: city.id,
          name: city.name,
          country: city.country ? city.country.name : null,
        };
        // Legacy compatibility
        userObj.city_name = city.name;
        userObj.country = city.country ? city.country.name : userObj.country;
      }
    }

    res.json(buildSuccessResponse(userObj));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateGoogleAuth,
  googleCallback,
  refresh,
  logout,
  getCurrentUser,
};
