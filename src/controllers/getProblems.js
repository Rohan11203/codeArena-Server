import { Router } from "express";

export const getProblems =  Router();

getProblems.get('/', (req, res) => {
  // Get all problems from the database
  res.json({
    message: "All problems",
    // Add your logic here to fetch all problems from the database
  });
});

getProblems.get('/:id', (req, res) => {
  // Get a specific problem by ID from the database
  res.json({
    message: "Problem by ID",
    // Add your logic here to fetch the problem with the given ID from the database
  });
});