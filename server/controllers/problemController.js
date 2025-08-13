const Problem = require('../models/problemModel.js');
const express = require('express');

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

exports.createProblem = async (req, res) => {
  const { title, description, inputFormat, outputFormat, constraints, examples, difficulty, tags } = req.body;
  try {
    const newProblem = new Problem({
      title,
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      difficulty,
      tags
    });
    await newProblem.save();
    res.status(201).json({ message: 'Problem created successfully', problem: newProblem });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

exports.updateProblem = async (req, res) => {
  const { id } = req.params;
  const { title, description, inputFormat, outputFormat, constraints, examples, difficulty, tags } = req.body;
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(id, {
      title,
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      difficulty,
      tags
    }, { new: true });
    
    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found!' });
    }
    res.status(200).json({ message: 'Internal server error', updatedProblem });
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