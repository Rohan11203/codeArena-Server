import { Router } from "express";
import axios from "axios";
import { ProblemModel, UserModel } from "../db/index.js";

export const submitCode = Router();

submitCode.post("/", async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { sourceCode, language, problemId } = req.body;

    const problem = await ProblemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const pistonPayload = {
      language: language,
      version: "*",
      files: [
        {
          content: sourceCode,
        },
      ],
    };

    // Call the Piston API to execute the code
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      pistonPayload
    );

    const finalOutput = response.data.run.output;
    const errorOutput = response.data.run.stderr;
    console.log("Final output:", finalOutput);

    res.json({
      message: "Code submitted",
      output: finalOutput || "No output available",
      problem,
      errorOutput,
    });
  } catch (error) {
    if (error.response) {
      console.error("Piston API Error:", error.response.data);
      return res
        .status(500)
        .json({
          message: "Error with the Piston API",
          details: error.response.data,
        });
    } else {
      console.error("Error executing code:", error.message);
      return res
        .status(500)
        .json({ message: "Error executing code", details: error.message });
    }
  }
});
