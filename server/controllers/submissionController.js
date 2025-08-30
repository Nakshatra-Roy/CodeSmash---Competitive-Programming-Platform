const Submission = require('../models/submissionModel.js');
const User = require("../models/userModel.js"); 
const Problem = require("../models/problemModel.js");
const express = require('express');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

exports.createSubmission = async (req, res) => {
  const { problem, language, source } = req.body;

  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.flag !== false || user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account has been flagged or deactivated. Please contact support.",
      });
    }

    const problemDoc = await Problem.findById(problem).select("examples");
    if (!problemDoc || !problemDoc.examples?.length) {
      return res.status(400).json({ message: "Problem examples not found" });
    }

    const exampleText = problemDoc.examples[0];
    const inputMatch = exampleText.match(/Input:\s*([\s\S]*?)\nOutput:/i);
    const outputMatch = exampleText.match(/Output:\s*([\s\S]*?)(\nExplanation:|$)/i);

    if (!inputMatch || !outputMatch) {
      return res.status(400).json({ message: "Invalid example format" });
    }

    const sampleInput = inputMatch[1].trim();
    const sampleOutput = outputMatch[1].trim();

    const languageMap = {
      cpp17: 54,
      cpp20: 76,
      python3: 71,
      java17: 62,
      js_node: 63,
      c: 50,
      csharp: 51,
      go: 60,
      rust: 73,
      kotlin: 78,
      php: 68,
      ruby: 72,
      scala: 81
    };

    const language_id = languageMap[language];
    if (!language_id) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const judgeRes = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: source,
          language_id,
          stdin: sampleInput
        })
      }
    );

    const judgeData = await judgeRes.json();

    let verdict;
    if (judgeData.status?.description?.toLowerCase().includes("error")) {
      verdict = judgeData.status.description;
    } else if ((judgeData.stdout || "").trim() === sampleOutput) {
      verdict = "Accepted ✅";
    } else {
      verdict = "Wrong Answer ❌";
    }

    const submission = new Submission({
      problem,
      user: userId,
      language,
      source,
      stdin: sampleInput,
      verdict,
      time: judgeData.time ? `${judgeData.time * 1000}` : "—",
      memory: judgeData.memory ? `${judgeData.memory}` : "—",
      output: judgeData.stdout || judgeData.stderr || ""
    });

    const saved = await submission.save();
    await User.findByIdAndUpdate(userId, {
      $push: { submissions: submission._id }
    });

    await Problem.findByIdAndUpdate(problem, { $inc: { submissions: 1 } });
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating submission:", err.message);
    res.status(500).json({ error: "Failed to create submission" });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .populate("problem", "title")
      .populate("user", "name _id");

    const formatted = submissions.map((s) => ({
      id: s._id,
      problem: s.problem.title,
      user: {
        id: s.user._id,
        name: s.user.name
      },
      language: s.language,
      verdict: s.verdict,
      time: s.time,
      memory: s.memory,
      createdAt: s.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching submissions:", err.message);
    res.status(500).json({ error: "Could not load submissions" });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id)
      .populate("problem", "title description")
      .populate("user", "username _id name");

    if (!sub) return res.status(404).json({ error: "Submission not found" });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: "Error fetching submission" });
  }
};

exports.updateSubmission = async (req, res) => {
  const { id } = req.params;
  const { problem, language, source, stdin, verdict, time, memory, output } = req.body;
  try {
    const updatedSubmission = await Submission.findByIdAndUpdate(id, {
        problem,
        language,
        source,
        stdin,
        verdict,
        time,
        memory,
        output
    }, { new: true });
    
    if (!updatedSubmission) {
      return res.status(404).json({ message: 'Submission not found!' });
    }
    res.status(200).json({ message: 'Internal server error', updatedSubmission });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

exports.rejudgeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const problemDoc = await Problem.findById(submission.problem).select("examples");
    if (!problemDoc || !problemDoc.examples?.length) {
      return res.status(400).json({ message: "Problem examples not found" });
    }

    const exampleText = problemDoc.examples[0];
    const inputMatch = exampleText.match(/Input:\s*([\s\S]*?)\nOutput:/i);
    const outputMatch = exampleText.match(/Output:\s*([\s\S]*?)(\nExplanation:|$)/i);

    if (!inputMatch || !outputMatch) {
      return res.status(400).json({ message: "Invalid example format" });
    }

    const sampleInput = inputMatch[1].trim();
    const sampleOutput = outputMatch[1].trim();

    const languageMap = {
      cpp17: 54,
      cpp20: 76,
      python3: 71,
      java17: 62,
      js_node: 63,
      c: 50,
      csharp: 51,
      go: 60,
      rust: 73,
      kotlin: 78,
      php: 68,
      ruby: 72,
      scala: 81
    };

    const language_id = languageMap[submission.language];
    if (!language_id) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const judgeRes = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: submission.source,
          language_id,
          stdin: sampleInput
        })
      }
    );

    const judgeData = await judgeRes.json();

    let verdict;
    if (judgeData.status?.description?.toLowerCase().includes("error")) {
      verdict = judgeData.status.description;
    } else if ((judgeData.stdout || "").trim() === sampleOutput) {
      verdict = "Accepted ✅";
    } else {
      verdict = "Wrong Answer ❌";
    }

    submission.verdict = verdict;
    submission.time = judgeData.time ? `${judgeData.time * 1000}` : "—";
    submission.memory = judgeData.memory ? `${judgeData.memory}` : "—";
    submission.output = judgeData.stdout || judgeData.stderr || "";
    submission.stdin = sampleInput;

    await submission.save();

    res.json({ message: "Rejudged successfully", submission });
  } catch (err) {
    console.error("Error rejudging submission:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSubmission = async (req, res) => {
  const { id } = req.params;
  try {
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    const deletedSubmission = await Submission.findByIdAndDelete(id);
    if (!deletedSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    await User.findByIdAndUpdate(submission.user, {
      $pull: { submissions: deletedSubmission._id }
    });
    await Problem.findByIdAndUpdate(submission.problem, {
      $inc: { submissions: -1 }
    });
    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}