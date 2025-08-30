import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/authContext";

const SubmissionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setSubmission(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchSubmission();
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this submission? ⚠️ This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || `Delete failed (${res.status})`);

      toast.success("Submission deleted successfully.");
      navigate("/submissions");
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  if (loading) return <div className="card glass skeleton" style={{ height: 220 }} />;

  if (error) return (
    <div className="card glass">
      <strong style={{ color: "#ef4444" }}>Error:</strong> {error}
    </div>
  );

  if (!submission) return null;

  return (
    <div style={{ padding: "32px 0" }}>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>
      <div className="section-head">
        <h2>
          Submission Report: <strong>{submission.id || submission._id}</strong>
          <br />
          <span className={`pill ${getVerdictColor(submission.verdict)}`}>Verdict: {submission.verdict || "Pending"}</span>
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            className="btn tiny glossy ghost"
            onClick={async () => {
              if (!window.confirm("⚠️ Are you sure you want to rejudge this submission? This action cannot be undone.")) return;
              try {
                const res = await fetch(`/api/submissions/${submission._id}/rejudge`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                  }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to rejudge");
                toast.success("Rejudged: " + data.submission.verdict);
                setSubmission(data.submission);
              } catch (err) {
                toast.error(err.message);
              }
            }}
          >
            🛠️ Rejudge
          </button>


          {isAdmin && (
            <button className="btn glossy danger" onClick={handleDelete}>
              🗑️ Delete
            </button>
          )}

          <Link to="/submissions" className="btn tiny ghost">← Back</Link>
        </div>
      </div>

      <div className="grid" style={{ gap: 16 }}>
        <div className="card glass">
          <h3 className="card-title" style={{ marginBottom: 8 }}>
            Problem: <strong>{submission.problem?.title || "Untitled Problem"}</strong>
          </h3>
          <p>Description: {submission.problem?.description || "This problem has no description."}</p>
          {submission.problem?._id && (
            <Link to={`/problems/${submission.problem._id}`} className="btn tiny ghost" style={{ marginTop: 8 }} target="_blank" rel="noopener noreferrer">
              Open Problem →
            </Link>
          )}
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Submitted on: {new Date(submission.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid cols-2">
          <div className="card glass">
            <h4>Metadata</h4>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 6 }}>⌨️ Language: {submission.language}</p>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 6 }}>⏱ Time: {submission.time || "N/A"} ms</p>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>💾 Memory: {submission.memory || "N/A"} KB</p>
          </div>

          <div className="card glass">
            <h4>Custom Input</h4>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{submission.stdin || "—"}</pre>
          </div>
        </div>

        <div className="card glass" style={{ overflow: "hidden" }}>
          <h4>Source Code</h4>
          <pre
            style={{
              margin: 0,
              padding: "12px",
              background: "rgba(255,255,255,0.02)",
              color: "var(--text)",
              fontFamily: "JetBrains Mono, monospace",
              borderRadius: 8,
              fontSize: 13,
              whiteSpace: "pre-wrap",
              border: "1px solid var(--border)",
            }}
          >
            {submission.source}
          </pre>
        </div>
      </div>

      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
};

const getVerdictColor = (verdict) => {
  if (!verdict) return "unknown";
  const v = verdict.toLowerCase();
  if (v.includes("accepted")) return "easy";
  if (v.includes("wrong") || v.includes("error")) return "hard";
  if (v.includes("time") || v.includes("memory")) return "medium";
  return "unknown";
};

export default SubmissionView;