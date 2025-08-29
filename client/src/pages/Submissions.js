import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/authContext";

const Submissions = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [verdicts, setVerdicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [userFocus, setUserFocus] = useState(false);
  const [verdictFocus, setVerdictFocus] = useState(false);
  const navigate = useNavigate();

  const glassBlueStyle = {
    position: "relative",
    borderRadius: 10,
    width: 180,
    fontSize: 16,
    color: "#ffffffff",
    background: "#2f364269",
    backdropFilter: "blur(8px) saturate(150%)",
    WebkitBackdropFilter: "blur(8px) saturate(150%)",
    border: "1px solid rgba(0, 102, 255, 0.4)",
    boxShadow: "4px 4px 5px rgba(2, 0, 129, 0.42)",
    padding: "8px",
    userSelect: "none",
    outline: "none",
    marginRight: "10px",
    transition: "all 0.5s ease",
  };

  const glassBlueFocus = {
    ...glassBlueStyle,
    background: "#00000069",
    boxShadow: "0 0 10px rgba(0, 60, 255, 0.63)",
    border: "1px solid rgba(0, 255, 255, 0.8)",
  };


  useEffect(() => {
    axios
      .get("/api/submissions")
      .then((res) => {
        setSubs(res.data);
        setLoading(false);

        const uniqueVerdicts = Array.from(new Set(res.data.map((s) => s.verdict))).filter(Boolean);
        setVerdicts(uniqueVerdicts);

        if (user?.role === "admin") {
          const uniqueUsers = Array.from(
            new Map(res.data.map((s) => [s.user.id, s.user])).values()
          );
          setUsers(uniqueUsers);
        }
      })
      .catch(() => {
        setError("Could not load submissions");
        setLoading(false);
      });
  }, [user?.role]);

  const filteredSubs = subs.filter((s) => {
    const isMine = user?.role !== "admin" ? s.user?.id === user?._id : true;
    const matchesSearch = !search || s.problem.toLowerCase().includes(search.toLowerCase());
    const matchesUser = !selectedUser || s.user?.id === selectedUser;
    const matchesVerdict = !selectedVerdict || s.verdict === selectedVerdict;
    return isMine && matchesSearch && matchesUser && matchesVerdict;
  });

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "32px 0" }}>
        <div
          className="section-head"
          style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          {user?.role !== "admin" && <h2>Your Submissions. True Treasure.</h2>}

          <div className="filter-section" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/" className="btn tiny ghost">
              ← Home
            </Link>

            {/* Problem Search */}
            <input
              type="text"
              placeholder="Search by problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={searchFocused ? glassBlueFocus : glassBlueStyle}
            />

            {/* Verdict filter */}
            <select
              value={selectedVerdict}
              onChange={(e) => setSelectedVerdict(e.target.value)}
              onFocus={() => setVerdictFocus(true)}
              onBlur={() => setVerdictFocus(false)}
              style={verdictFocus ? glassBlueFocus : glassBlueStyle}
            >
              <option value="">All Verdicts</option>
              {verdicts.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            {/* Admin User filter */}
            {user?.role === "admin" && (
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                style={userFocus ? glassBlueFocus : glassBlueStyle}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            <button
            className="btn glossy primary"
            onClick={() => {
              setSearch("");
              setSelectedUser("");
              setSelectedVerdict("");
            }}
          >
          Reset Filters
          </button>
          </div>
                  
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
            {filteredSubs.length > 0 ? (
              filteredSubs.map((s, i) => (
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
                    <button className="btn tiny glossy ghost" onClick={() => navigate(`/submissions/${s.id || s._id}`)}>
                      ✏️ Open
                    </button>
                  </div>
                  <br/>
                  <span className="pill">Submitted: {new Date(s.createdAt).toLocaleString("en-GB")}</span>
                </div>
              ))
            ) : (
              <div className="card glass">No submissions found matching your filters.</div>
            )}
          </div>
        )}
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
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