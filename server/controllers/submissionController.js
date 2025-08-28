const Submission = require('../models/submissionModel.js');
const User = require("../models/userModel.js"); 
const express = require('express');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

exports.createSubmission = async (req, res) => {
  const { problem, language, source, stdin } = req.body;

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

    const submission = new Submission({
      problem,
      user: userId,
      language,
      source,
      stdin,
    });

    const saved = await submission.save();
    await User.findByIdAndUpdate(userId, {
    $push: { submissions: submission._id }
  });
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
      .populate("user", "name");

    const formatted = submissions.map((s) => ({
      id: s._id,
      problem: s.problem.title,
      user: {
        id: s.user._id,
        name: s.user.name
      },
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
    //   .populate("user", "username");

    if (!sub) return res.status(404).json({ error: "Not found" });
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
    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}