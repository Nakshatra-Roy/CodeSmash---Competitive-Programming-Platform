const Contest = require('../models/contestModel.js');
const express = require('express');

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
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

exports.createContest = async (req, res) => {
  const { title, description, startTime, endTime, banner, duration, organizer, authors, problems, status, participants, tags } = req.body;
  try {
    const newContest = new Contest({
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
    });
    await newContest.save();
    res.status(201).json({ message: 'Contest created successfully', contest: newContest });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

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
    res.status(200).json({ message: 'Internal server error', updatedContest });
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