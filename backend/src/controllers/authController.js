const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("../config/config");
const UserModel = require("../models/User");
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

          let user = await UserModel.findByGoogleId(googleId);

          if (!user) {
            user = await UserModel.findByEmail(email);

            if (user) {
              user = await UserModel.update(user.id, { googleId });
            } else {
              user = await UserModel.create({
                email,
                googleId,
                fullName,
                photoUrl,
              });
            }
          } else {
            user = await UserModel.update(user.id, { fullName, photoUrl });
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
    const user = await UserModel.findById(id);
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

const refresh = async (req, res) => {
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

    const user = await UserModel.findById(decoded.id);

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
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to refresh token")
      );
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json(buildSuccessResponse({ message: "Logged out successfully" }));
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    res.json(buildSuccessResponse(user));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch user")
      );
  }
};

module.exports = {
  initiateGoogleAuth,
  googleCallback,
  refresh,
  logout,
  getCurrentUser,
};
