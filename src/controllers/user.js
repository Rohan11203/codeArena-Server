import { Router } from "express";
import { validateUserData } from "../validators/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../db/index.js";
import { Userauth } from "../auth/auth.js";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const parsedData = validateUserData.safeParse(req.body);

  if (!parsedData.success) {
    console.log(parsedData.error.errors.map(err => err.message)); // Prints the error message
    res.status(400).json({ message: "Validation failed", errors: parsedData.error.errors });
    
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    await UserModel.create({
      name : name,
      email : email,
      password : hashedPassword,
    });

  } catch (e) {
    console.log("error creating user ",e);
    return res.status(500).json({ message: "Error creating user" });
  }
  res.json({
    message: "signup successfull",
  });
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try{
    const response = await UserModel.findOne({
      email: email,
    });

    if(!response){
       res.status(403).json({
        message: "email does not exists",
      });
      return
    }

    const passwordMatch =  await bcrypt.compare(password, response.password);
  
    if(!passwordMatch){
      res.status(403).json({
        message: "password does not match",
      });
      return  // return to avoid unnecessary executions. 403 Forbidden means the request was valid but the server is refusing to fulfill it. In this case, the password is wrong.
    }
      const token = jwt.sign(
        {
          userId: response._id,
        },
        process.env.JWT_USER_SECRET,
      );
      res.json({
        message: "signin successfull",
        token: token,
      });
  }
  catch (e) {
    console.log("error ", e);
    return res.status(401).json({
      message: "Invalid email or password",
    })
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
