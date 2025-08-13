const Submission = require('../models/submissionModel.js');
const express = require('express');

exports.createSubmission = async (req, res) => {
  try {
    const { problem, language, source, stdin } = req.body;
    // const user = req.user?.id || "64a..."; // Replace with auth logic if available

    const submission = new Submission({
      problem,
    //   user,
      language,
      source,
      stdin,
    });

    const saved = await submission.save();
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
    //   .populate("user", "username");

    const formatted = submissions.map((s) => ({
      id: s._id,
      problem: s.problem.title,
      verdict: s.verdict,
      time: s.time,
      memory: s.memory,
      createdAt: s.createdAt,
    }));

    res.json(formatted);
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
    const deletedSubmission = await Submission.findByIdAndDelete(id);
    if (!deletedSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}