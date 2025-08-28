import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import toast, { Toaster } from "react-hot-toast";

const ContestView = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const { user } = useAuth();

  const isLoggedInAdmin = user && user.role === "admin";

  useEffect(() => { 
    fetch(`/api/contests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setContest(data);
        setLoading(false);
      })
      .catch(() => {
        setContest(null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (contest.status === "Upcoming") {
        const diff = start - now;
        setTimeRemaining(diff > 0 ? formatDuration(diff) : "Contest starting soon...");
      } else if (contest.status === "Ongoing") {
        const diff = end - now;
        setTimeRemaining(diff > 0 ? formatDuration(diff) : "Contest has ended.");
      } else if (contest.status === "Pending") {
        setTimeRemaining("Contest waiting for admin approval...");
      } else if (contest.status === "Rejected") {
        setTimeRemaining("Contest has been rejected. Contact Support.");
      } else {
        setTimeRemaining("Contest has ended.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <div className="card glass" style={{ margin: 48, padding: 32 }}>Loading contest...</div>;
  }

  if (!contest) {
    return <div className="card glass" style={{ margin: 48, padding: 32 }}>Contest not found.</div>;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background layer */}
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "32px 16px", maxWidth: 960, margin: "0 auto" }}>
        {isLoggedInAdmin && (
        <Link to="/admin/contests" className="btn tiny ghost" style={{ marginBottom: 24 }}>
          ← All Contests
        </Link>
        )}
        {!isLoggedInAdmin && (
        <Link to="/contests" className="btn tiny ghost" style={{ marginBottom: 24 }}>
          ← All Contests
        </Link>
        )}

        {/* Hero section */}
        <div className="card glass" style={{ padding: 24, textAlign: "center", marginBottom: 32 }}>
          <h1 className="card-title" style={{ fontSize: "2rem", marginBottom: 8 }}>
            {contest.title}
          </h1>
          <div className="card-sub" style={{ marginBottom: 8 }}>
            <span className={`pill ${contest.status.toLowerCase()}`} style={{ marginRight: 8 }}>
              {contest.status}
            </span>
            <span className="badge code">{contest.duration} mins</span>
          </div>
          <p style={{ fontWeight: "bold", marginBottom: 8 }}>
            Organized by: <span style={{ color: "#7f5af0" }}>{contest.organizer}</span>
          </p>
          <p style={{ marginBottom: 8 }}>
            {formatDateTime(contest.startTime)} → {formatDateTime(contest.endTime)}
          </p>
          <p style={{ fontSize: "1.1rem", color: "#f5b759", fontWeight: "600" }}>
            {timeRemaining}
          </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
              {isLoggedInAdmin && (contest.status == "Pending" || contest.status == "Rejected") && (
              <button
                className="btn glossy primary"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/contests/${contest._id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({ ...contest, status: "Upcoming" }),
                    });
                    if (!res.ok) throw new Error("Failed to approve contest");
                    const { updatedContest } = await res.json();
                    setContest(updatedContest);
                    toast.success("Contest approved.");
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
              >
                ✅ Approve
              </button>
            )}

            {isLoggedInAdmin && contest.status == "Ongoing" && (
              <button
                className="btn glossy danger"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/contests/${contest._id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({ ...contest, status: "Completed" }),
                    });
                    if (!res.ok) throw new Error("Failed to end contest.");
                    const { updatedContest } = await res.json();
                    setContest(updatedContest);
                    toast.success("Contest ended.");
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
              >
                ❌ END
              </button>
            )}

            {isLoggedInAdmin && (contest.status == "Rejected" || contest.status == "Upcoming") && (
              <button
                className="btn glossy primary"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/contests/${contest._id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({ ...contest, status: "Pending" }),
                    });
                    if (!res.ok) throw new Error("Failed to set contest to pending.");
                    const { updatedContest } = await res.json();
                    setContest(updatedContest);
                    toast.success("Contest set to pending.");
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
              >
                ⚠️ Pending
              </button>
              )}

            {isLoggedInAdmin && (contest.status == "Pending" || contest.status == "Upcoming")  && (
              <button
                className="btn glossy danger"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/contests/${contest._id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({ ...contest, status: "Rejected" }),
                    });
                    if (!res.ok) throw new Error("Failed to reject contest");
                    const { updatedContest } = await res.json();
                    setContest(updatedContest);
                    toast.success("Contest rejected.");
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
              >
                ❌ Reject
              </button>
              )}
            </div>
          


        </div>

        <img
          src={contest.banner || "https://placehold.co/800x200?text=Contest+Banner"}
          alt="Contest Banner"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 12,
            marginBottom: 32,
            boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
          }}
        />

        <div className="card glass" style={{ padding: 24 }}>
          <div className="popover-desc" style={{ marginBottom: 24 }}>
            <strong>Description:</strong>
           <div className="description">
            {contest.description.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>



          </div>

          {contest.tags?.length > 0 && (
            <div className="popover-tags" style={{ marginBottom: 16 }}>
              {contest.tags.map((tag, i) => (
                <span className="tag" key={i} style={{ "--i": i }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {contest.authors?.length > 0 && (
            <div className="card-sub" style={{ marginBottom: 16 }}>
              <strong>Authors:</strong>{" "}
              {contest.authors.map((a, i) => (
                <span className="tag" key={i} style={{ marginRight: 6 }}>
                  👤 {typeof a === "object" ? a.name : `User ${i + 1}`}
                </span>
              ))}
            </div>
          )}

          {contest.problems?.length > 0 && (
            <div className="card-sub" style={{ marginTop: 16 }}>
              <strong>Problems:</strong>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                {contest.problems.map((prob, i) => (
                  <li key={i}>
                    <Link to={`/problems/${typeof prob === "object" ? prob._id : prob}`}>
                      {typeof prob === "object" ? prob.title : `Problem ${i + 1}`}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
};

export default ContestView;