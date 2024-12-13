import { Router } from "express";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (req, res) => {
  // Fetch leaderboard data from your database
  res.json({
    message: "Leaderboard data"
  })
});