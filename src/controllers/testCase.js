import { Router } from "express";
import { TestCasesModel } from "../db/index.js";

export const testCase = Router();

testCase.post("/add", async (req, res) => {
  const { problemId, codeSnippet, callExpression } = req.body;
  // Fetch leaderboard data from your database
  await TestCasesModel.create({
        problemId,
        codeSnippet,
        callExpression
      });
  res.json({
    message: "Testcase"
  })
});
