const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    bio: { type: String },
    contests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }],
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission" }],

    socialLinks: { 
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    
    flag: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ["active", "inactive"], default: "active" },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
