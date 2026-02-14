const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, update online status
          user.isOnline = true;
          user.lastSeen = new Date();
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          username: profile.displayName || profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          password: 'google-oauth-' + Math.random().toString(36), // Random password for OAuth users
          googleId: profile.id,
          isOnline: true,
          lastSeen: new Date(),
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;