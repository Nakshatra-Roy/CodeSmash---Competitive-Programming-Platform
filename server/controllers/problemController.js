const Problem = require('../models/problemModel.js');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel.js");

const JWT_SECRET = process.env.JWT_SECRET;

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().populate('author', 'name name _id').sort({ createdAt: -1 });
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id).populate('author', 'name _id');
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}


exports.createProblem = async (req, res) => {
  const {
    title,
    description,
    constraints,
    examples,
    difficulty,
    tags
  } = req.body;

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
    const creator = await User.findById(userId);
        if (!creator) {
          return res.status(404).json({ message: "User not found" });
        }
    
        if (creator.flag !== false || creator.accountStatus !== "active") {
          return res.status(403).json({
            message: "Your account has been flagged or deactivated. Please contact support.",
          });
        }

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      tags,
      constraints,
      examples,
      author: userId
    });

    await newProblem.save();
    await User.findByIdAndUpdate(userId, {
    $push: { problems: newProblem._id }
  });
    res.status(201).json({ message: 'Problem created successfully', problem: newProblem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};


exports.updateProblem = async (req, res) => {
  const { id } = req.params;
  const { title, description, difficulty, tags, constraints, examples, status } = req.body;
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(id, {
      title,
      description,
      difficulty,
      tags,
      constraints,
      status,
      examples
    }, { new: true }).populate('author', 'name _id');
    
    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found!' });
    }
    res.status(200).json({ updatedProblem, message: 'Problem updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

exports.deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}