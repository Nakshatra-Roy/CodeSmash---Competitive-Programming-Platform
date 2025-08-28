const Contest = require('../models/contestModel.js');
const User = require("../models/userModel.js");
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    res.status(200).json(contests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getContestById = async (req, res) => {
  const { id } = req.params;
  try {
    const contest = await Contest.findById(id)
      .populate('authors', 'username _id name'); // populate each author with these fields

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};


exports.createContest = async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    banner,
    duration,
    organizer,
    otherAuthorsUsernames = [],
    problems = [],
    tags = [],
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

    const additionalAuthors = [];
    for (const username of otherAuthorsUsernames) {
      const user = await User.findOne({ username: username.trim() });
      if (user) additionalAuthors.push(user._id);
    }

    const authorsArray = [userId, ...additionalAuthors];

    const newContest = new Contest({
      title,
      description,
      startTime,
      endTime,
      banner: banner || "default-banner-url",
      duration,
      organizer,
      authors: authorsArray,
      problems,
      tags,
    });

    await newContest.save();
    await User.findByIdAndUpdate(userId, {
    $push: { contests: newContest._id }
  });
    res.status(201).json({ message: "Contest created successfully", contest: newContest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.updateContest = async (req, res) => {
  const { id } = req.params;
  const { title, description, startTime, endTime, banner, duration, organizer, authors, problems, status, participants, tags } = req.body;
  try {
    const updatedContest = await Contest.findByIdAndUpdate(id, {
        title,
        description,
        startTime,
        endTime,
        banner,
        duration,
        organizer,
        authors,
        problems,
        status,
        participants,
        tags
    }, { new: true });
    
    if (!updatedContest) {
      return res.status(404).json({ message: 'Contest not found!' });
    }
    res.status(200).json({ message: 'Contest updated successfully', updatedContest });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}


exports.deleteContest = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContest = await Contest.findByIdAndDelete(id);
    if (!deletedContest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.status(200).json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}