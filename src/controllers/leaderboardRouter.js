import { Router } from "express";
import { UserModel } from "../db/index.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (req, res) => {
  // Fetch leaderboard data from your database
  const allUsers = await UserModel.find();
  console.log(allUsers);
  const Users = allUsers.map((obj) => {
    return { name: obj.name, totalScore: obj.totalScore };
  });
  console.log(Users);
  res.json({
    message: "Leaderboard data",
    Users
  });
});
