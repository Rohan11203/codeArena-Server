import { Router } from "express";
import axios from 'axios';

export const submitCode = Router();

submitCode.post("/", async (req, res) => {
  // Logic to submit code and handle errors
  try {

    console.log('Received code submission:' + req.body);

    const { code, language } = req.body;

    // payload for Piston API
    const pistonPayload = {
      language: language || 'python',
      version: '*',
      files: [{ name: 'main', content: code }],
    };

   
    const response = await axios.post(
      'https://emkc.org/api/v2/piston/execute',
      pistonPayload
    );
    
    console.log(response.data.run.output);
  } catch (error) {
    if (error.response) {
      console.error('Piston API Error:', error.response.data);
    } else {
      console.error('Error executing code:', error.message);
    }
  }
  
  res.json({
    messsage: 'Code submitted'
  })
});