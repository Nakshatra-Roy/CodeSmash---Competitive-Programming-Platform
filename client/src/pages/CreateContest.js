import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/authContext';
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';

const CreateContest = () => {
  const [newContest, setNewContest] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    banner: "",
    duration: 60,
    organizer: "",
    otherAuthorsUsernames: [],
    problems: [],
    tags: [],
  });

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "⚠️ Are you sure you want to reset? Your changes will be lost."
    );
    if (!confirmReset) return;
    setNewContest({
                        title: "",
                        description: "",
                        startTime: "",
                        endTime: "",
                        banner: "",
                        duration: 60,
                        organizer: "",
                        otherAuthorsUsernames: [],
                        problems: [],
                        tags: [],
                      })
  }

  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const show = (type, message) => {
    if (type === "warning" || type === "error") toast.error(message);
    else toast.success(message);
  };

  const onChange = (key, value) =>
    setNewContest(prev => ({ ...prev, [key]: value }));

  const handleAddContest = async (e) => {
    e?.preventDefault();

    const required = [
      ["title", newContest.title],
      ["description", newContest.description],
      ["startTime", newContest.startTime],
      ["endTime", newContest.endTime],
      ["duration", newContest.duration],
      ["organizer", newContest.organizer],
      ["problems", newContest.problems],
      ["tags", newContest.tags]
    ];

    const missing = required
      .filter(([, v]) => !v || (Array.isArray(v) && v.length === 0))
      .map(([k]) => k);

    if (missing.length) {
      show("warning", `Please fill: ${missing.join(", ")}`);
      return;
    }

    const confirmReset = window.confirm(
      "⚠️ Are you sure you want to submit? You won't be able to edit the contest again till it is approved."
    );
    if (!confirmReset) return;

    try {
      setLoading(true);
      const res = await axios.post("/api/contests", newContest, { withCredentials: true });
      show("success", "Contest has been submitted for admin approval.");
      setNewContest({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        banner: "",
        duration: 60,
        organizer: "",
        otherAuthorsUsernames: [],
        problems: [],
        tags: [],
      });
    } catch (err) {
      show("error", err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
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
            <h2>Create New Contest</h2>
            <Link to="/contests" className="btn tiny ghost">← All Contests</Link>
          </div>

          <div className="card glass">
            <form onSubmit={handleAddContest} className="offer-form">
              <div className="form-shell">

                <div className="field">
                  <label className="label">Title*</label>
                  <input
                    className="input glass-input"
                    value={newContest.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Contest title"
                  />
                </div>

                <div className="field">
                  <label className="label">Description*</label>
                  <textarea
                    className="input glass-input textarea"
                    value={newContest.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    placeholder="Describe the contest in the best way possible.
                    Include any important dates, rules and regulations, and contact information."
                  />
                </div>

                <div className="grid cols-2 gap">
                  <div className="field">
                    <label className="label">Start Time*</label>
                    <input
                      type="datetime-local"
                      className="input glass-input"
                      value={newContest.startTime}
                      onChange={(e) => onChange("startTime", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="label">End Time*</label>
                    <input
                      type="datetime-local"
                      className="input glass-input"
                      value={newContest.endTime}
                      onChange={(e) => onChange("endTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Duration (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    className="input glass-input"
                    value={newContest.duration}
                    onChange={(e) => onChange("duration", parseInt(e.target.value || "60"))}
                  />
                </div>

                <div className="field">
                  <label className="label">Contest Banner (Paste direct link)</label>
                  <input
                    type="number"
                    min={1}
                    className="input glass-input"
                    value={newContest.banner}
                    onChange={(e) => onChange("banner", e.target.value)}
                    placeholder="https://i.postimg.cc/XXXXXX/BUCC-BIT-Battles.png"
                  />
                </div>

                <div className="field">
                  <label className="label">Organizer*</label>
                  <input
                    className="input glass-input"
                    value={newContest.organizer}
                    onChange={(e) => onChange("organizer", e.target.value)}
                    placeholder="e.g. BRAC University, Bangladesh Computer Society"
                  />
                </div>

                <div className="field">
                  <label className="label">Other Authors (comma separated usernames)</label>
                  <input
                    className="input glass-input"
                    placeholder="Optional, e.g. JohnCena, MaryJane"
                    value={newContest.otherAuthorsUsernames.join(", ")}
                    onChange={(e) =>
                      onChange("otherAuthorsUsernames", e.target.value.split(",").map(t => t.trim()))
                    }
                  />
                </div>

                <div className="field">
                  <label className="label">Problems* (comma separated Problem IDs)</label>
                  <input
                    className="input glass-input"
                    value={newContest.problems.join(", ")}
                    placeholder="e.g. 68960f655de78454c7219670, 68960f4b5de78454c7219668"
                    onChange={(e) =>
                      onChange("problems", e.target.value.split(",").map(t => t.trim()))
                    }
                  />
                </div>

                <div className="field">
                  <label className="label">Tags* (comma separated)</label>
                  <input
                    className="input glass-input"
                    value={newContest.tags.join(", ")}
                    placeholder="e.g. array, easy, DFS"
                    onChange={(e) =>
                      onChange("tags", e.target.value.split(",").map(t => t.trim()))
                    }
                  />
                </div>
                <div className="field">
                    <label className="label">*Fields are required</label>
                </div>


                <div className="actions">
                  <button type="submit" className="btn glossy primary">
                    {loading ? "Creating..." : "Create Contest"}
                  </button>
                  <button
                    type="button"
                    className="btn glossy ghost"
                    onClick={handleReset}
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

      <style>{`
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
      `}</style>
    </>
  );
};

export default CreateContest;