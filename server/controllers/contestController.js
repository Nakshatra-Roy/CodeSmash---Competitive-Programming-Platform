const Contest = require('../models/contestModel.js');
const User = require("../models/userModel.js");
const mongoose = require("mongoose");
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
      .populate('authors', 'username _id name')
      .populate('participants', 'username _id name')
      .populate('problems', 'title _id difficulty');

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
      banner: banner || "https://placehold.co/1280x720?text=Upload+Your+Banner",
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
    
    if (additionalAuthors.length > 0) {
      await User.updateMany(
        { _id: { $in: additionalAuthors } },
        { $push: { contests: newContest._id } }
      );
    }
    res.status(201).json({ message: "Contest created successfully", contest: newContest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.updateContest = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    startTime,
    endTime,
    banner,
    duration,
    organizer,
    authors,
    problems,
    tags,
    status,
  } = req.body;

  try {
    const sanitizeIds = (arr) => {
      if (!Array.isArray(arr)) return undefined;
      const result = arr
        .filter(a => a)
        .map(a => {
          if (!mongoose.Types.ObjectId.isValid(a)) {
            throw new Error(`Invalid ObjectId: ${a}`);
          }
          return new mongoose.Types.ObjectId(a);
        });
      return result.length > 0 ? result : undefined;
    };

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (banner) updateData.banner = banner;
    if (organizer) updateData.organizer = organizer;
    if (duration !== undefined) updateData.duration = duration;

    if (startTime) {
      const s = new Date(startTime);
      if (isNaN(s)) throw new Error("Invalid startTime");
      updateData.startTime = s;
    }

    if (endTime) {
      const e = new Date(endTime);
      if (isNaN(e)) throw new Error("Invalid endTime");
      updateData.endTime = e;
    }

    const authorsArray = sanitizeIds(authors);
    if (authorsArray) updateData.authors = authorsArray;

    const problemsArray = sanitizeIds(problems);
    if (problemsArray) updateData.problems = problemsArray;

    if (Array.isArray(tags)) updateData.tags = tags;
    if (status) updateData.status = status;

    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedContest) {
      return res.status(404).json({ message: "Contest not found!" });
    }

    res.status(200).json({ message: "Contest updated successfully", updatedContest });
  } catch (error) {
    console.error("Update contest error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.enrollContest = async (req, res) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const userId = decoded.id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.flag !== false || user.accountStatus !== "active") {
    return res.status(403).json({
      message: "Your account has been flagged or deactivated. Please contact support.",
    });
  }

  const { contestId } = req.body;
  if (!contestId) return res.status(400).json({ message: "Contest ID required." });

  try {
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found." });

    if (contest.participants.includes(userId)) {
      return res.status(400).json({ message: "You are already enrolled in this contest." });
    }

    contest.participants.push(userId);
    await contest.save();

    user.contestEnroll.push(contestId);
    await user.save();

    return res.status(200).json({ message: "Enrolled successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.unenrollContest = async (req, res) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const userId = decoded.id;
  const { contestId } = req.body;

  if (!contestId) return res.status(400).json({ message: "Contest ID is required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.flag !== false || user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account has been flagged or deactivated. Please contact support.",
      });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    contest.participants = (contest.participants || []).filter(
      p => p.toString() !== userId
    );

    await contest.save();

    user.contestEnroll = (user.contestEnroll || []).filter(
      cId => cId.toString() !== contestId
    );

    await user.save();

    return res.status(200).json({ message: "Successfully unenrolled from contest." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

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