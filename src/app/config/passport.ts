import { IAuthProvider, Role } from "./../modules/user/user.interface";
import bcryptjs from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import {
  Strategy as googleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import passport, { Profile } from "passport";
import { IsActive } from "../modules/user/user.interface";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";

passport.use(
  new googleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        const googleId = profile.id;

        if (!email) {
          return done(
            new Error("Google profile did not provide an email address.")
          );
        }

        // 1. Check if a user with this Google ID already exists
        let user = await User.findOne({
          "auths.providerId": googleId,
          "auths.provider": "google",
        });

        if (user) {
          return done(null, user);
        }

        // 2. Check if a user with this email exists but hasn't linked Google yet
        user = await User.findOne({ email });

        if (
          user &&
          (user.isActive === IsActive.BLOCKED ||
            user.isActive === IsActive.INACTIVE)
        ) {
          return done(null, false, {
            message: "Account is suspended. Contact administrator.",
          });
        }

        if (user && user.isDeleted) {
          return done(null, false, { message: "Account is deleted." });
        }

        if (user) {
          const newAuth: IAuthProvider = {
            provider: "google",
            providerId: googleId,
          };

          user.auths.push(newAuth);
          user.isVerified = true;

          await user.save();
          return done(null, user);
        }

        // Case 3: New User - Create a new account
        const newAuth: IAuthProvider = {
          provider: "google",
          providerId: googleId,
        };
        const newUser = await User.create({
          email,
          name: profile.displayName,
          picture: profile.photos?.[0].value,
          role: Role.USER,
          isVerified: true,
          auths: [newAuth],
        });

        return done(null, newUser);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Google Auth Strategy Error:", err);
        return done(err);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        if (!user.isVerified) {
          return done(null, false, { message: "Account is not verified." });
        }

        if (
          user.isActive === IsActive.BLOCKED ||
          user.isActive === IsActive.INACTIVE
        ) {
          return done(null, false, {
            message: "Account is suspended. Contact administrator.",
          });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "Account is deleted." });
        }

        const isGoogleAuthenticated = user.auths.some(
          (providerObject) => providerObject.provider == "google"
        );

        if (isGoogleAuthenticated && !user.password) {
          return done(null, false, {
            message: `You’ve authenticated via Google. To enable credential-based login (email and password), first log in using Google, then set a password via your registered email. Once configured, you can authenticate using standard credentials.`,
          });
        }

        const isMatch = await bcryptjs.compare(
          password as string,
          user.password as string
        );

        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Local Strategy Error:", err);
        return done(err);
      }
    }
  )
);

// stateful session

// passport.serializeUser(
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   (user: any, done: (err: any, id?: unknown) => void) => {
//     done(null, user._id);
//   }
// );

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// passport.deserializeUser(async (id: string, done: any) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });
