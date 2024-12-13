import { Router } from "express";

export const submitCode = Router();

submitCode.post("/", async (req, res) => {
  // Logic to submit code and handle errors
  
  res.json({
    messsage: 'Code submitted'
  })
});