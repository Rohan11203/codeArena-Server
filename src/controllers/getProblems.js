import { Router } from "express";
import { ProblemModel } from "../db/index.js";

export const getProblems =  Router();

getProblems.get('/',async (req, res) => {
  const problem = await ProblemModel.find();
  console.log(problem);
  res.json({
    message: "All problems",
    problems: problem,
    // Add your logic here to fetch all problems from the database
  });
});

getProblems.post('/add', async (req,res) => {
  const { title, description, sampleInput, sampleOutput, testCases  } = req.body;

  try{
    await ProblemModel.create({
      title,
      description,
      sampleInput,
      sampleOutput,
      testCases,
    })
  }
  catch(e){
    console.log("Error In try"+e);
    res.status(500).json({ message: "Error while adding problem" });
    return;
  }
  // Add a new problem to the database
  
  res.json({
    message: "New problem added",
  });
})
getProblems.get('/:id', async (req, res) => {
  const problem = await ProblemModel.findById(req.params.id);
  if (!problem) {
    return res.status(404).json({ message: "Problem not found" });
  }

  res.json({
    message: "Problem by ID",
    problem,
    // Add your logic here to fetch the problem with the given ID from the database
  });
});