import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

export const configurePassport = () => {
  // 1. Google OAuth20 Passport Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || 'Google User';
          const avatar = profile.photos?.[0]?.value || '';

          if (!email) {
            return done(new Error('No email address provided by Google OAuth'), null);
          }

          let user = await User.findOne({
            $or: [{ googleId }, { email }],
          }).select('+googleId');

          if (user) {
            if (!user.googleId) {
              user.googleId = googleId;
            }
            if (avatar && !user.avatar) {
              user.avatar = avatar;
            }
            await user.save();
          } else {
            user = await User.create({
              name,
              email,
              googleId,
              avatar,
              accountType: 'student',
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('Passport Google Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );

  // 2. GitHub OAuth Passport Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const githubId = profile.id;
          const email = profile.emails?.[0]?.value || `${profile.username || githubId}@users.noreply.github.com`;
          const name = profile.displayName || profile.username || 'GitHub Developer';
          const avatar = profile.photos?.[0]?.value || profile._json?.avatar_url || '';

          let user = await User.findOne({
            $or: [{ githubId }, { email }],
          }).select('+githubId');

          if (user) {
            if (!user.githubId) {
              user.githubId = githubId;
            }
            if (avatar && !user.avatar) {
              user.avatar = avatar;
            }
            await user.save();
          } else {
            user = await User.create({
              name,
              email,
              githubId,
              avatar,
              accountType: 'student',
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('Passport GitHub Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );
};

export default passport;
