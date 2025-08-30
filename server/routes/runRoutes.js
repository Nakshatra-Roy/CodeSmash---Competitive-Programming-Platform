// routes/runRoutes.js
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { language, source, stdin } = req.body;

  const languageMap = {
    cpp17: 54,
    cpp20: 76,
    python3: 71,
    java17: 62,
    js_node: 63,
    c: 50,
    csharp: 51,
    go: 60,
    rust: 73,
    kotlin: 78,
    php: 68,
    ruby: 72,
    scala: 81
  };

  const language_id = languageMap[language];
  if (!language_id) {
    return res.status(400).json({ message: "Unsupported language" });
  }

  try {
    const judgeRes = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: source,
          language_id,
          stdin
        })
      }
    );

    const judgeData = await judgeRes.json();
    let verdict;
    if (judgeData.status?.description?.toLowerCase().includes("error")) {
    verdict = judgeData.status.description;
    } else if ((judgeData.stdout || "").trim()) {
    verdict = "Output Generated";
    } else {
    verdict = judgeData.status?.description || "Unknown";
    }

    res.json({
    stdout: judgeData.stdout,
    stderr: judgeData.stderr,
    status: judgeData.status?.description,
    verdict,
    time: judgeData.time,
    memory: judgeData.memory
    });
  } catch (err) {
    console.error("Run error:", err.message);
    res.status(500).json({ message: "Failed to run code" });
  }
});

module.exports = router;