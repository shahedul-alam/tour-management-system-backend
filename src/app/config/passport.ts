/* eslint-disable no-console */
import bcryptjs from "bcryptjs";
import passport, { Profile } from "passport";
import {
  Strategy as googleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";

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

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await User.findOne({ email });

        if (user && !user.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        if (
          user &&
          (user.isActive === IsActive.BLOCKED ||
            user.isActive === IsActive.INACTIVE)
        ) {
          done(`User is ${user.isActive}`);
        }

        if (user && user.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, user);
      } catch (error) {
        console.log("Google strategy error", error);
        return done(error);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      try {
        const isUserEXists = await User.findOne({ email });

        if (!isUserEXists) {
          return done("User does not exist");
        }

        if (!isUserEXists.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
          return done("User is not verified");
        }

        if (
          isUserEXists.isActive === IsActive.BLOCKED ||
          isUserEXists.isActive === IsActive.INACTIVE
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
          return done(`User is ${isUserEXists.isActive}`);
        }
        if (isUserEXists.isDeleted) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
          return done("User is deleted");
        }

        const isGoogleAuthenticated = isUserEXists.auths.some(
          (providerObject) => providerObject.provider == "google"
        );

        if (isGoogleAuthenticated && !isUserEXists.password) {
          return done(
            "You have authenticated through Google login. If you want to login using credentials, then at first login with Google and set password using your email and then you can login with email and password."
          );
        }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserEXists.password as string
        ); 

        if (!isPasswordMatched) {
          return done("Incorrect password");
        }

        return done(null, isUserEXists);
      } catch (error) {
        console.log("Local strategy error", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log("Google deserializeUser error", error);
    done(error);
  }
});
