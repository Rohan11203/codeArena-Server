import { Router } from "express";
import { getProblems } from '../controllers/getProblems.js'
import { submitCode } from '../controllers/submitCode.js';
import { leaderboardRouter } from '../controllers/leaderboardRouter.js';
import { userRouter } from '../controllers/user.js';

export const routes = Router();

routes.use("/user", userRouter);
// Get ALl Problems
routes.use("/problem" , getProblems);
// Submit code for a problem
routes.use("/submission", submitCode);
// Leaderboard
routes.use("/leaderboard", leaderboardRouter);