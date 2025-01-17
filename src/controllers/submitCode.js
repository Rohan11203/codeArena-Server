import { Router } from "express";
import axios from "axios";
import { ProblemModel, UserModel } from "../db/index.js";

export const submitCode = Router();

async function runCodeWithTests(code, testCases,language) {
  const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';
  const results = {
      passed: 0,
      failed: 0,
      total: testCases.length,
      details: []
  };

  for (const [index, testCase] of testCases.entries()) {
      // Wrap the code with test case input
      const wrappedCode = `
          ${code}
      `;

      try {
          // Call Piston API
          const response = await axios.post(PISTON_API_URL, {
              language: language,
              version: '18.15.0',
              files: [{ content: wrappedCode }]
          });
          if (response.data.run.output) {
              // Parse the output and compare with expected result
              const outputStr  = response.data.run.output.trim();

              let actualOutput;
              try{
                actualOutput = JSON.parse(outputStr)
              }
              catch(error){
                actualOutput = outputStr
              } 
              const passed = JSON.stringify(actualOutput) === JSON.stringify(testCase.expectedOutput);

              results.details.push({
                  testCase: index + 1,
                  passed,
                  input: testCase.input,
                  expected: testCase.expectedOutput,
                  actual: actualOutput,
              });

              if (passed) results.passed++;
              else results.failed++;
          } else {

              results.details.push({
                  testCase: index + 1,
                  passed: false,
                  input: testCase.input,
                  error: 'No output produced'
              });
              results.failed++;
          }
      } catch (error) {
          results.details.push({
              testCase: index + 1,
              passed: false,
              input: testCase.input,
              error: error.response?.data?.message || error.message
          });
          results.failed++;
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

submitCode.post("/", async (req, res) => {
  try {
    const { code, testCases,language } = req.body;

    if (!code || !testCases || !Array.isArray(testCases)) {
        return res.status(400).json({
            error: 'Invalid request. Please provide code and testCases array.'
        });
    }

    const results = await runCodeWithTests(code, testCases,language);
    res.json(results);

} catch (error) {
    res.status(500).json({
        error: 'Test execution failed',
        message: error.message
    });
}
});
