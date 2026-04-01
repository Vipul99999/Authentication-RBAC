import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db";
import { env } from "./env";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email from Google"), null);
        }

        // 🔒 IMPORTANT: Only allow existing users
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return done(new Error("User not allowed. Contact admin."), null);
        }

        // Link OAuth account if not exists
        const existing = await prisma.oAuthAccount.findFirst({
          where: {
            provider: "google",
            providerId: profile.id,
          },
        });

        if (!existing) {
          await prisma.oAuthAccount.create({
            data: {
              userId: user.id,
              provider: "google",
              providerId: profile.id,
              email,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;