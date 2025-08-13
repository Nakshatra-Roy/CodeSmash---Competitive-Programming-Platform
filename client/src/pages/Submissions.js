import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Problems.css"; // Reuse styling from Problems page

const Submissions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/submissions")
      .then((res) => {
        setSubs(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load submissions");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background layer */}
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      {/* Foreground content */}
      <div style={{ position: "relative", zIndex: 1, padding: "32px 0" }}>
        <div className="section-head">
          <h2>Your Submissions. True Treasure.</h2>
          <Link to="/" className="btn tiny ghost">
            ← Home
          </Link>
        </div>

        {loading && (
          <div className="grid cols-3 cards" style={{ gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="card glass skeleton" key={i} style={{ height: 180 }} />
            ))}
          </div>
        )}

        {error && <div className="card glass">{error}</div>}

        {!loading && (
          <div className="grid cols-3 cards" style={{ gap: 14 }}>
            {subs.map((s, i) => (
              <div className="card glass hover-lift" key={s.id || i}>
                <div className="card-head">
                  <span className="badge code">{s.language?.toUpperCase() || "LANG"}</span>
                  <span className={`pill ${getVerdictColor(s.verdict)}`}>
                    {s.verdict || "Pending"}
                  </span>
                </div>

                <h3 className="card-title">{s.problem || "Untitled Problem"}</h3>

                <p className="card-sub">
                  <span className="tag">Time: {s.time || "N/A"}</span>
                  <span className="tag">Memory: {s.memory || "N/A"}</span>
                </p>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn tiny glossy ghost" onClick={() => window.location.href = `/report/${s.id}`}>
                    📊 Report
                  </button>
                  <button className="btn tiny glossy ghost">🛠️ Rejudge</button>
                  <button className="btn tiny glossy ghost" onClick={() => navigate(`/submissions/${s.id || s._id}`)}>✏️ Open</button>
                </div>
              </div>
            ))}

            {subs.length === 0 && (
              <div className="card glass">Oops, you haven't submitted anything yet! Try solving a problem.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Utility to style verdict pills
const getVerdictColor = (verdict) => {
  if (!verdict) return "unknown";
  const v = verdict.toLowerCase();
  if (v.includes("accepted")) return "easy";
  if (v.includes("wrong") || v.includes("error")) return "hard";
  if (v.includes("time") || v.includes("memory")) return "medium";
  return "unknown";
};

export default Submissions;