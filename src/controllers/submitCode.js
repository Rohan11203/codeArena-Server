import { Router } from "express";
import axios from "axios";
import { ProblemModel } from "../db/index.js";

export const submitCode = Router();

async function runCodeWithTests(code, testCases, language) {
    const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';
    const results = {
        passed: 0,
        failed: 0,
        total: testCases.length,
        details: []
    };

    for (const [index, testCase] of testCases.entries()) {
        const wrappedCode = `${code}`;

        try {
            // Call Piston API
            const response = await axios.post(PISTON_API_URL, {
                language: language,
                version: '*',
                files: [{ content: wrappedCode }]
            });

            if (response.data.run.output) {
                // Split the output by newlines (handles multiple console.log)
                let outputLines = response.data.run.output.trim().split("\n");

                let expectedOutput = testCase.expectedOutput;
                if (typeof expectedOutput === "string" || typeof expectedOutput === "boolean") {
                    expectedOutput = testCase.expectedOutput;
                } else {
                    expectedOutput = Array.isArray(testCase.expectedOutput) 
                        ? testCase.expectedOutput 
                        : [testCase.expectedOutput];
                }

                // parsing each line as JSON
                let parsedOutputs = outputLines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return line;
                    }
                });

                console.log(`Actual Outputs:`, parsedOutputs);
                console.log(`Expected Outputs:`, expectedOutput);

                const passed = JSON.stringify(parsedOutputs[index]) === JSON.stringify(expectedOutput);

                console.log(`Parsed Output (JSON):`, JSON.stringify(parsedOutputs));
                console.log(`Expected Output (JSON):`, JSON.stringify(expectedOutput));
                console.log(`Test Passed?`, passed);

                results.details.push({
                    testCase: index + 1,
                    passed,
                    input: testCase.input,
                    expected: expectedOutput,
                    actual: parsedOutputs[index],
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
            console.error("Error running code:", error);
            results.details.push({
                testCase: index + 1,
                passed: false,
                input: testCase.input,
                error: error.response?.data?.message || error.message
            });
            results.failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
}


submitCode.post("/", async (req, res) => {
    try {
        const { code, language, problemId } = req.body;

        if (!code || !problemId) {
            return res.status(400).json({ error: 'Invalid request. Provide code and problemId.' });
        }

        const problem = await ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found.' });
        }

        const testCases = problem.testCases;

        const results = await runCodeWithTests(code, testCases, language);
        res.json(results);

    } catch (error) {
        res.status(500).json({
            error: 'Test execution failed',
            message: error.message
        });
    }
});
