import { Router } from "express";
import { validateUserData } from "../validators/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../db/index.js";
import { Userauth } from "../auth/auth.js";

export const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const parsedData = validateUserData.safeParse(req.body);

  if (!parsedData.success) {
    console.log(parsedData.error.errors.map(err => err.message)); // Prints the error message
    return res.status(400).json({ message: "Validation failed", Error: parsedData.error.errors.map(err => err.message) });
    
    
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    await UserModel.create({
      name : name,
      email : email,
      password : hashedPassword,
    });

    return res.status(201).json({
      success : true,
      message: "The Registration was successfull",
    });

  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ Error: e.message });
  }
 
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;


  try{
    const response = await UserModel.findOne({
      email: email,
    });

    if(!response){
      return res.status(403).json({
        message: "email does not exists",
      });
      
    }

    const passwordMatch =  await bcrypt.compare(password, response.password);
  
    if(!passwordMatch){
      return res.status(403).json({
        message: "password does not match",
      });
       
    }
      const token = jwt.sign(
        {
          userId: response._id,
        },
        process.env.JWT_USER_SECRET,
      );
      return res.status(200).cookie("token", token,{ httpOnly: true }).json({
        success: true,
        message: "Login successful",
        token: token,
      })
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

userRouter.get("/logout", Userauth, async (req, res) => {
  try{
   return res.status(200).clearCookie('token',{ httpOnly:true }).json({
    success: true,
    message: "Logged out successfully",
   })
  }catch (error) {
    console.log(error.message)
    return res.status(500).json({ 
      Error: error.message 
    });
  }
})

userRouter.put("/update", Userauth, async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true }
    );
    
    if (!user) return res.status(404).send('User not found');
    res.status(200).json(user);
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json({ message: "Server error" });
  }
});