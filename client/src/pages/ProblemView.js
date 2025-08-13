import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomDropdown from "./CustomDropdown";
import "./Landing.css";

const LANGUAGES = [
  { id: "cpp17", label: "C++17" },
  { id: "cpp20", label: "C++20" },
  { id: "python3", label: "Python 3" },
  { id: "java17", label: "Java 17" },
  { id: "js_node", label: "Node.js" },
  { id: "c", label: "C" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "kotlin", label: "Kotlin" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "scala", label: "Scala" },
];

const DEFAULT_TEMPLATES = {
  cpp17: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // TODO: implement
    return 0;
}
`,
  cpp20: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // C++20 features welcome
    return 0;
}
`,
  python3: `# Write your Python 3 solution here
def solve():
    # TODO: implement
    pass

if __name__ == "__main__":
    solve()
`,
  java17: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // TODO: implement
    }
}
`,
  js_node: `// Node.js solution template
'use strict';

function main() {
  // TODO: implement
}

main();
`,
  c: `#include <stdio.h>

int main() {
    // TODO: implement
    return 0;
}
`,
  csharp: `using System;

class Program {
    static void Main() {
        // TODO: implement
    }
}
`,
  go: `package main

import "fmt"

func main() {
    // TODO: implement
}
`,
  rust: `fn main() {
    // TODO: implement
}
`,
  kotlin: `fun main() {
    // TODO: implement
}
`,
  ruby: `# TODO: implement

`,
  php: `<?php
// TODO: implement
?>
`,
  scala: `object Main extends App {
    // TODO: implement
}
`,
};

function useLocalDraft(problemId, language) {
  const key = useMemo(() => {
    if (!problemId) return null;
    return `draft:${problemId}:${language}`;
  }, [problemId, language]);

  const [value, setValue] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [isDirty, setDirty] = useState(false);

  useEffect(() => {
    if (!key) return;
    const saved = localStorage.getItem(key);
    if (saved != null) {
      setValue(saved);
      setSavedAt(new Date());
      setDirty(false);
    } else {
      setValue(DEFAULT_TEMPLATES[language] || "");
      setSavedAt(null);
      setDirty(true);
    }
  }, [key, language]);

  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, value || "");
        setSavedAt(new Date());
        setDirty(false);
      } catch {}
    }, 700);
    return () => clearTimeout(t);
  }, [key, value]);

  return { value, setValue, savedAt, isDirty, setDirty };
}

const ProblemView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(`lang:${id}`);
    return saved || "cpp17";
  });
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`lang:${id}`, language);
  }, [id, language]);

  const {
    value: sourceCode,
    setValue: setSourceCode,
    savedAt,
    isDirty,
    setDirty,
  } = useLocalDraft(id, language);

  const [customInput, setCustomInput] = useState(() => {
    return localStorage.getItem(`stdin:${id}`) || "";
  });
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => localStorage.setItem(`stdin:${id}`, customInput), 500);
    return () => clearTimeout(t);
  }, [id, customInput]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/problems/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch problem (${res.status})`);
        const data = await res.json();
        if (alive) setProblem(data);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: id,
          language,
          source: sourceCode,
          stdin: customInput || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      const data = await res.json();
      const sid = data._id || data.id || "";
      navigate(`/submissions?highlight=${sid}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    const tpl = DEFAULT_TEMPLATES[language] || "";
    setSourceCode(tpl);
    setDirty(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode || "");
    } catch {}
  };

  return (
    <div style={{ padding: "32px 0" }}>
      <div className="section-head">
        <h2 style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
          {problem?.title}
          <span className={`pill ${problem?.difficulty?.toLowerCase?.() || ""}`}>
            {problem?.difficulty || "Loading…"}
          </span>
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CustomDropdown options={LANGUAGES} value={language} onChange={setLanguage} />
                <button onClick={handleCopy} className="btn glossy ghost">Copy</button>
                <button onClick={handleReset} className="btn glossy ghost">Reset</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn glossy primary"
                >
                  {submitting ? "Submitting…" : "🚀 Submit"}
                </button>
              </div>
      </div>
      

      {loading && <div className="card glass skeleton" style={{ height: 220 }} />}
      {error && (
        <div className="card glass" style={{ borderColor: "rgba(239,68,68,0.4)" }}>
          <strong style={{ color: "#ef4444" }}>Error:</strong> {error}
        </div>
      )}

      {!loading && problem && (
        <div className="grid" style={{ gap: 16 }}>
          <div className="card glass">
            <p style={{ whiteSpace: "pre-wrap", color: "var(--muted)" }}>
              {problem.description || "No statement available."}
            </p>
          </div>

          <div className="grid cols-2">
            <div className="card glass">
              <h4>Constraints</h4>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {(problem.constraints && problem.constraints.length > 0)
                  ? problem.constraints.join("\n")
                  : "Not provided."}
              </pre>
              <h4>Tags</h4>
              <div className="tags">
                {(problem.tags || []).length > 0 ? (problem.tags.map((tag, i) => 
                (<span className="tag" key={i} style={{ marginRight: 6}}>#{tag}</span>))) : (<span className="tag" style={{ opacity: 0.6 }}>No tags available</span>)}
              </div>
            </div>

            <div className="card glass">
              <h4>Sample Input & Output:</h4>
              <pre style={{ margin: 0 }}>{problem.examples || "—"}</pre>
            </div>
          </div>
          
        
          <div className="card glass">
            <h4>Editor</h4>
            <textarea
              rows={20}
              value={sourceCode}
              onChange={(e) => {
                setSourceCode(e.target.value);
                setDirty(true);
              }}
              style={{
                width: "100%",
                fontFamily: "JetBrains Mono, monospace",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text)",
                borderRadius: 8,
                border: "1px solid var(--border)",
                padding: 10,
                resize: "vertical",
              }}
            />

            <label style={{ display: "block", margin: "12px 0 6px", color: "var(--muted)" }}>
              Custom input (optional)
            </label>
            <textarea
              rows={6}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text)",
                fontFamily: "JetBrains Mono, monospace",
                borderRadius: 8,
                border: "1px solid var(--border)",
                padding: 10,
                resize: "vertical",
              }}
              placeholder="Paste input here to test locally before submitting"
            />

            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>
              Tips:
              <ul>
                <li>Use the language drop-down menu to select your favorite programming language.</li>
                <li>Code auto-saves every ~700ms.</li>
                <li>Use “Reset” button to reload a clean language template.</li>
                <li>Submit only when you're 100% sure your code works!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemView;