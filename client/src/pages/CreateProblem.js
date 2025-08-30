import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/authContext';
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';

const CreateProblem = () => {
  const [newProblem, setNewProblem] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    tags: [],
    constraints: [],
    examples: [],
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const show = (type, message) => {
    if (type == "warning" || type == "error") {
        toast.error(message)
    }
    else {
        toast.success(message)
    }
  };
  
  const onChange = (key, value) =>
    setNewProblem((prev) => ({ ...prev, [key]: value }));

  const handleAddProblem = async (e) => {
    e?.preventDefault();

    const required = [
      ["title", newProblem.title],
      ["description", newProblem.description],
      ["difficulty", newProblem.difficulty],
      ["tags", newProblem.tags],
      ["constraints", newProblem.constraints],
      ["examples", newProblem.examples],
    ];

    const missing = required
      .filter(([, v]) => !v || (Array.isArray(v) && v.length === 0))
      .map(([k]) => k);

    if (missing.length) {
      show("warning", `Please fill: ${missing.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "/api/problems",
        {
          ...newProblem,
          author: user?._id
        },
        { withCredentials: true }
      );
      show("success", "Problem created successfully! Awaiting admin approval.");
      setNewProblem({
        title: "",
        description: "",
        difficulty: "Medium",
        tags: [],
        constraints: [],
        examples: [],
      });
    } catch (err) {
      show("error", err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);


  if (loading) {
    return (
      <div>
        <div className="backdrop">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="grid-overlay" />
        </div>
        <div className="profile-loading">Loading page. Please wait...</div>
      </div>
    );
  }

  return (
    <>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Create New Problem</h2>
            <Link to="/problems" className="btn tiny ghost">← All Problems</Link>
          </div>

          {notice && (
                toast(notice.message)
          )}

          <div className="card glass">
            <form onSubmit={handleAddProblem} className="offer-form">
              <div className="form-shell">
                <div className="field">
                <p>All fields are required.</p>
                <br/>
                  <label className="label">Title</label>
                  <input
                    className="input glass-input"
                    placeholder="Choose an unique title!"
                    value={newProblem.title}
                    onChange={(e) => onChange("title", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label">Description</label>
                  <textarea
                    className="input glass-input textarea"
                    placeholder="Describe the problem in details. Include examples."
                    value={newProblem.description}
                    onChange={(e) => onChange("description", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label">Difficulty</label>
                  <select
                    className="input glass-input"
                    value={newProblem.difficulty}
                    onChange={(e) => onChange("difficulty", e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="field">
                  <label className="label">Tags (comma separated)</label>
                  <input
                    className="input glass-input"
                    placeholder="e.g., arrays, dp, bfs, dfs"
                    value={newProblem.tags.join(", ")}
                    onChange={(e) =>
                      onChange(
                        "tags",
                        e.target.value.split(",").map((t) => t.trim())
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label className="label">Constraints (comma separated)</label>
                  <input
                    className="input glass-input"
                    placeholder="e.g., 1 ≤ N ≤ 1000, 1s"
                    value={newProblem.constraints.join(", ")}
                    onChange={(e) =>
                      onChange(
                        "constraints",
                        e.target.value.split(",").map((c) => c.trim())
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label className="label">Sample Input/Output (comma separated)</label>
                  <textarea
                    className="input glass-input textarea"
                    placeholder="e.g.
                    Input:
                    1 2
                    3 4
                    Output:
                    9 10
                    11 12"
                    value={newProblem.examples.join(", ")}
                    onChange={(e) =>
                      onChange(
                        "examples",
                        e.target.value.split(",").map((x) => x.trim())
                      )
                    }
                  />
                </div>

                <div className="actions">
                  <button
                    type="submit"
                    className="btn glossy primary"
                    disabled={loading}
                    style={{ opacity: loading ? 0.8 : 1 }}
                  >
                    {loading ? "Creating..." : "Create Problem"}
                  </button>
                  <button
                    type="button"
                    className="btn glossy ghost"
                    onClick={() =>
                      setNewProblem({
                        title: "",
                        description: "",
                        difficulty: "Medium",
                        tags: [],
                        constraints: [],
                        examples: [],
                      })
                    }
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Toaster position="bottom-right" reverseOrder={false} />

      <style>
        {`
          .offer-form .form-shell { padding: 16px; }
          .offer-form .field { margin-bottom: 14px; }
          .offer-form .label { display: block; font-weight: 600; margin-bottom: 6px; }
          .offer-form .input.glass-input {
            width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid var(--border);
            color: white;
            background: rgba(3, 2, 19, 0.8);
            backdrop-filter: blur(8px) saturate(120%);
            -webkit-backdrop-filter: blur(8px) saturate(120%);
            transition: all 0.5s ease;
          }
          .offer-form .input.glass-input:focus {
            outline: none;
            background: rgba(0, 58, 73, 0.8);
            border-color: rgba(0, 238, 255, 0.5);
            color: white;
            box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.15);
          }
          .offer-form .textarea { min-height: 120px; resize: vertical; }
          .offer-form .actions { display: flex; gap: 12px; margin-top: 18px; }
        `}
      </style>
    </>
  );
};

export default CreateProblem;