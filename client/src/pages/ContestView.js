import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import toast, { Toaster } from "react-hot-toast";

const ContestView = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useAuth();

  const isLoggedInAdmin = user && user.role === "admin";

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        const filteredUsers = Array.isArray(data) ? data.filter(u => u.role === "user") : [];
        setAllUsers(filteredUsers);
      })
      .catch(err => console.error("Failed to fetch users", err));
  }, []);


  useEffect(() => {
    if (contest) {
      setFormData({
        ...contest,
        authors: contest.authors?.map(a => typeof a === "object" ? a._id : a) || [],
      });

      // Ensure logged-in user is always included
      if (user && !contest.authors?.some(a => (a._id || a) === user._id)) {
        setFormData(prev => ({
          ...prev,
          authors: [user._id, ...(prev.authors || [])],
        }));
      }
    }
  }, [contest, user]);

  useEffect(() => {
    fetch(`/api/contests/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Contest not found");
        }
        return res.json();
      })
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEnroll = async () => {
    if (!contest?._id) return;

    const confirmEnroll = window.confirm("⚠️ Are you sure you want to enroll in this contest? This action can't be undone if the contest begins.");
    if (!confirmEnroll) return;

    try {
      const res = await fetch("/api/contests/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ contestId: contest?._id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Enrollment failed");
      setContest(prev => ({
        ...prev,
        participants: [...(prev.participants || []), user._id],
      }));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUnenroll = async () => {
    if (!contest?._id) return;

    const confirmUnenroll = window.confirm(
      "⚠️ Are you sure you want to unenroll from this contest? This action can't be undone if the contest begins."
    );
    if (!confirmUnenroll) return;

    try {
      const res = await fetch("/api/contests/unenroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ contestId: contest._id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Unenrollment failed.");

      setContest(prev => ({
        ...prev,
        participants: (prev.participants || []).filter(
          p => (p._id || p) !== user._id
        ),
      }));

      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };


  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData) return;

    const confirmSubmit = window.confirm(
      "⚠️ Are you sure you want to submit? You won't be able to edit the contest again until admin approval."
    );
    if (!confirmSubmit) return;

    setSaving(true);

    try {
      const authorsForSubmit = formData.authors
        ?.map(a => (typeof a === "object" && a._id ? a._id : a))
        .filter(a => a && a.trim?.() !== "");

      const problemsForSubmit = formData.problems
        ?.map(p => (typeof p === "object" && p._id ? p._id : p))
        .filter(p => p && p.trim?.() !== "");


      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        banner: formData.banner,
        duration: formData.duration,
        tags: formData.tags,
        authors: authorsForSubmit,
        problems: problemsForSubmit,
        status: "Pending",
      };

      const res = await fetch(`/api/contests/${contest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update contest.");
      }

      const { updatedContest } = await res.json();
      setContest(updatedContest);
      toast.success("Contest updated successfully. Sent for admin approval.");
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return <div className="card glass" style={{ margin: 48, padding: 32 }}>Loading contest...</div>;
  }

  if (!contest) {
    return <div className="card glass" style={{ margin: 48, padding: 32 }}>Contest not found.</div>;
  }

  const isAuthor = contest?.authors?.some(a => a?._id?.toString() === user?._id);
  const isParticipant = contest?.participants?.some(a => a?._id?.toString() === user?._id);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "32px 16px", maxWidth: 960, margin: "0 auto" }}>
        {isLoggedInAdmin ? (
          <Link to="/admin/contests" className="btn tiny ghost" style={{ marginBottom: 24 }}>
            ← All Contests
          </Link>
        ) : (
          <Link to="/contests" className="btn tiny ghost" style={{ marginBottom: 24 }}>
            ← All Contests
          </Link>
        )}

        {/* Hero section */}
        <div className="card glass" style={{ padding: 24, textAlign: "center", marginBottom: 32 }}>
          <img
          src={contest.banner || "https://placehold.co/1280x720?text=Upload+Your+Banner"}
          alt="Contest Banner"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 12,
            marginBottom: 32,
            boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
          }}
        />
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

          {isLoggedInAdmin && (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
              {contest.status === "Pending" || contest.status === "Rejected" ? (
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
                        body: JSON.stringify({ status: "Upcoming" }),
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
              ) : null}

              {contest.status === "Ongoing" && (
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
                        body: JSON.stringify({ status: "Completed" }),
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

              {(contest.status === "Rejected" || contest.status === "Upcoming") && (
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
                        body: JSON.stringify({ status: "Pending" }),
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

              {(contest.status === "Pending" || contest.status === "Upcoming") && (
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
                        body: JSON.stringify({ status: "Rejected" }),
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
          )}


          {!isLoggedInAdmin &&
          (contest.status === "Upcoming" || contest.status === "Rejected")
          && isAuthor && (
            <button
              className="btn glossy primary"
              style={{ marginTop: "16px" }}
              onClick={() => {
                setFormData(contest);
                setEditing(!editing);
              }}
            >
              {editing ? "Cancel Edit" : "✏️ Edit Contest"}
            </button>
          )}

          {!isLoggedInAdmin && !isAuthor && !isParticipant && contest.status === "Upcoming" && (
            <button
              className="btn glossy primary"
              style={{ marginTop: "16px" }}
              onClick={handleEnroll}
            >
              ENROLL
            </button>
          )}
          {!isLoggedInAdmin && !isAuthor && isParticipant && contest.status === "Upcoming" && (
            <button
              className="btn glossy danger"
              style={{ marginTop: "16px" }}
              onClick={handleUnenroll}
            >
              UNENROLL
            </button>
          )}
        </div>
      
        {!editing ? (
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
                  <span className="btn tiny ghost" key={i} style={{ marginRight: 6 }}>
                    👤 {typeof a === "object" ? a.name : `User ${i + 1}`}
                  </span>
                ))}
              </div>
            )}

            {((isLoggedInAdmin || isAuthor) && contest.participants?.length > 0) && (
              <div className="card-sub" style={{ marginBottom: 16 }}>
                <strong>Participants:</strong>{" "}
                {contest.participants.map((p, i) => (
                  <span className="btn tiny ghost" key={i} style={{ marginRight: 6 }}>
                    👤 {typeof p === "object" ? p.name : `User ${i + 1}`}
                  </span>
                ))}
              </div>
            )}

            {(isLoggedInAdmin || isAuthor || (!isAuthor && isParticipant && contest.status === "Ongoing")) && (
              <div className="card-sub" style={{ marginTop: 16 }}>
                <strong>Problems:</strong>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  {contest.problems.map((prob, i) => (
                    <li key={i} style={{ marginBottom: "6px" }}>
                      <Link
                        className="btn tiny ghost"
                        to={`/problems/${prob._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        P{ i + 1 }: {prob.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}


          </div>
        ) : (


          /* Edit Form */
          <form className="card glass profile-form animate-right" onSubmit={handleSave}>
            <h3 className="card-title">Edit Contest</h3>
            <br />

            <div className="form-group">
              <label>Title</label>
              <input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
              <label>Banner URL</label>
              <input
                name="banner"
                value={formData.banner || ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                name="tags"
                value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags || ""}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()) })}
                className="cardInput input-full"
              />
            </div>
            <br />

            <div className="form-group">
            <label>Authors</label>
            <select
              multiple
              value={formData.authors || []} 
              onChange={(e) => {
                const selectedIds = Array.from(e.target.selectedOptions).map(opt => opt.value);
                const finalSelection = user ? [user._id, ...selectedIds.filter(id => id !== user._id)] : selectedIds;
                setFormData({ ...formData, authors: finalSelection });
              }}
              className="cardInput input-full"
            >
              {allUsers.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name || u.username}
                </option>
              ))}
            </select>
            <small>Select one or more authors (you are always included)</small>
          </div>


            <br />

            <div className="form-group">
              <label>Problems (comma-separated Problem IDs)</label>
              <input
                name="problems"
                value={
                  Array.isArray(formData.problems)
                    ? formData.problems
                        .map(p => (typeof p === "object" ? p._id : p))
                        .join(", ")
                    : ""
                }
                onChange={(e) => {
                  const newProblems = e.target.value.split(",").map((t) => t.trim());
                  setFormData({ ...formData, problems: newProblems });
                }}
                className="cardInput input-full"
                placeholder="e.g. 68960f655de78454c7219670, 68960f4b5de78454c7219668"
              />
            </div>

            <br />
            <div style={{ display: "flex", gap: "24px" }}>
            <button type="submit" className="btn glossy primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? "Saving..." : "Save changes"}
            </button>
                  
            <button
                className="btn glossy primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setFormData(contest);
                  setEditing(!editing);
                }}
              >
                {editing ? "Cancel Edit" : "✏️ Edit Contest"}
              </button>
            </div>
          </form>
        )}
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
};

export default ContestView;