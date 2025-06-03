import { Router } from "express";
import { validateUserData } from "../validators/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../db/index.js";
import { Userauth } from "../auth/auth.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import passport from "passport";
dotenv.config();

export const userRouter = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://codearena-server.onrender.com/api/user/auth/google/callback", // This is URL that is stored in Google COnsole
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },

    async (accessToken, refreshToken, profile, done) => {
      let user = await UserModel.findOne({ googleId: profile.id });

      if (!user) {
        const newUser = await UserModel.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          Avtar: `https://i.pravatar.cc/150?img=${randomNumber}`,
        });
          done(null, newUser);
      } else {
        done(null, user);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
userRouter.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Starting Google auth flow");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("https://codearena-frontend.onrender.com/dashboard");
  }
);

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const parsedData = validateUserData.safeParse(req.body);

  if (!parsedData.success) {
    console.log(parsedData.error.errors.map((err) => err.message)); // Prints the error message
    return res.status(400).json({
      message: parsedData.error.errors.map((err) => err.message),
    });
  }

  try {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const response = await UserModel.findOne({
      email: email,
    });

    if (response) {
      return res.status(403).json({
        message: "email Already Exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 5);
    await UserModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      Avtar: `https://i.pravatar.cc/150?img=${randomNumber}`,
    });

    return res.status(201).json({
      success: true,
      message: "The Registration was successfull",
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ Error: e.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await UserModel.findOne({
      email: email,
    });

    if (!response) {
      return res.status(403).json({
        message: "email does not exists",
      });
    }

    const passwordMatch = await bcrypt.compare(password, response.password);

    if (!passwordMatch) {
      return res.status(403).json({
        message: "password does not match",
      });
    }
    const token = jwt.sign(
      {
        userId: response._id,
      },
      process.env.JWT_USER_SECRET
    );
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // Needed for HTTPS (Render uses HTTPS)
        sameSite: "None", // Required for cross-origin cookies
        maxAge: 24 * 60 * 60 * 1000, // Optional: 1 day
      })
      .json({
        success: true,
        message: "Login successful",
        token,
      });
  } catch (e) {
    console.log("error ", e);
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
});

userRouter.get("/profile", Userauth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json({ message: "Server error" });
  }
});

userRouter.get("/logout", Userauth, async (req, res) => {
  try {
    return res.status(200).clearCookie("token", { httpOnly: true }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      Error: error.message,
    });
  }
});

userRouter.put("/update", Userauth, async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true }
    );

    if (!user) return res.status(404).send("User not found");
    res.status(200).json(user);
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json({ message: "Server error" });
  }
});
