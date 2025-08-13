const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true,},
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Assuming user authentication is in place
//     required: true,
//   },
  language: { type: String, enum: ["cpp17", "cpp20", "python3", "java17", "js_node", "c", "csharp", "go", "rust", "kotlin", "php", "ruby", "scala"], required: true },
  source: { type: String, required: true, },
  stdin: { type: String, default: "", },
  verdict: { type: String, num: ["Pending", "Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded"], default: "Pending", },
  time: { type: String, // e.g., "0.45s"
  default: "—", },
  memory: { type: String, // e.g., "15MB"
    default: "—", },
  output: { type: String, default: "", },
  createdAt: { type: Date, default: Date.now, },
});

module.exports = mongoose.model("Submission", submissionSchema);