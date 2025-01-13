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

getProblems.get("/random", async (req,res) => {
  const problems = await ProblemModel.find();
  if (!problems) {
    return res.status(404).json({ message: "No problems found" });
  }
  const randomIndex = Math.floor(Math.random() * problems.length);
  const randomProblem = problems[randomIndex]._id;
  
  
  res.json({
    message: "Random problem",
    problemId: randomProblem,
  })
})

getProblems.post('/add', async (req,res) => {
  const { title, description,difficulty, examples, constraints,testCases  } = req.body;

  try{
    await ProblemModel.create({
      title,
      description,
      difficulty,
      examples,
      constraints,
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

