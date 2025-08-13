import app from './app.js';
import mongoose from 'mongoose';
import problemRoutes from './routes/problemRoutes.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

// Middleware setup
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server connection successful, and is running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));