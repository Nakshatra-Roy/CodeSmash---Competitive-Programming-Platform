import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa";
import { createPortal } from "react-dom";

const CLOSE_DELAY = 220;

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [enrolledContests, setEnrolledContests] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [openMode, setOpenMode] = useState(null);

  const closeTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);

  useEffect(() => {
  if (!id) return;

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/users/${id}`, { withCredentials: true });
      setUser(res.data);

      const [allProblems, allContests, allSubs] = await Promise.all([
        axios.get("/api/problems"),
        axios.get("/api/contests"),
        axios.get("/api/submissions")
      ]);

      const userProblems = (allProblems.data || [])
        .filter(p => (res.data.problems || []).includes(p._id))
        .filter(p => p.status?.toLowerCase() === "approved");

      const userContests = (allContests.data || [])
        .filter(c => (res.data.contests || []).includes(c._id))
        .filter(c => {
          const status = (c.status || "").toLowerCase();
          return status !== "pending" && status !== "rejected";
        });

      const enrolled = (res.data.contestEnroll || [])
        .map(cid => allContests.data.find(c => c._id === cid))
        .filter(Boolean)
        .filter(c => {
          const status = (c.status || "").toLowerCase();
          return status !== "pending" && status !== "approved";
        });
    
      const userSubs = (allSubs.data || []).filter(s => s.user?.id === id);

      setProblems(userProblems);
      setContests(userContests);
      setEnrolledContests(enrolled);
      setSubmissions(userSubs);
    } catch (err) {
      toast.error(err.response?.data?.message || "User not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

    fetchData();
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(hoverTimerRef.current);
    };
  }, [id, navigate]);

  const cancelClose = () => clearTimeout(closeTimerRef.current);
  const scheduleClose = (delay = CLOSE_DELAY) => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenId(null);
      setOpenItem(null);
      setAnchorRect(null);
      setOpenMode(null);
    }, delay);
  };

  const openPopover = (id, rect, item, mode = "hover") => {
    cancelClose();
    setOpenId(id);
    setOpenItem(item);
    setAnchorRect(rect);
    setOpenMode(mode);
  };

  const handleEnter = (e, id, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => openPopover(id, rect, item, "hover"), 800);
  };
  const handleLeave = () => {
    clearTimeout(hoverTimerRef.current);
    scheduleClose();
  };
  const handleClick = (e, id, item) => {
    if (openId !== id) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      openPopover(id, rect, item, "click");
    }
  };

  if (loading || !user) {
    return (
      <div className="profile-page">
        <div className="backdrop">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="grid-overlay" />
        </div>
        <div className="container section">
          <div className="skeleton card glass">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div className="container section profile-wrapper">
        <aside className="card glass profile-aside animate-left">
          <div className="avatar-wrap">
            <img
              src={user.avatar || "https://i.postimg.cc/9XdrBtYQ/Profile-avatar-placeholder-large.png"}
              alt={user.username}
              className="avatar"
            />
          </div>

          <br />
          <div className="identity">
            <h2 className="hero-title shine">@{user.username}</h2>
            <p className="muted">{user.name}</p>
            <p className="muted small">{user.email}</p>
            {user.bio && <p className="muted small">"{user.bio}"</p>}
          </div>

          <div className="stats">
            <div className="stat-card">🏆 Contests Hosted: {contests.length}</div>
            <div className="stat-card">🏆 Contests Enrolled: {enrolledContests.length}</div>
            <div className="stat-card">📚 Problems Written: {problems.length}</div>
            <div className="stat-card">📄 Submissions: {submissions.length}</div>
          </div>
          <br/>
        
          {/* Social Links */}
          <div className="social-links">
            {user.socialLinks?.github && (
              <a className="btn tiny ghost" href={user.socialLinks.github} target="_blank" rel="noreferrer">
                <FaGithub size={20} /> GitHub
              </a>
            )}
            {user.socialLinks?.linkedin && (
              <a className="btn tiny ghost" href={user.socialLinks.linkedin} target="_blank" rel="noreferrer">
                <FaLinkedin size={20} /> LinkedIn
              </a>
            )}
            {user.socialLinks?.twitter && (
              <a className="btn tiny ghost" href={user.socialLinks.twitter} target="_blank" rel="noreferrer">
                <FaTwitter size={20} /> Twitter
              </a>
            )}
            {user.socialLinks?.website && (
              <a className="btn tiny ghost" href={user.socialLinks.website} target="_blank" rel="noreferrer">
                <FaGlobe size={20} /> Website
              </a>
            )}
          </div>
        </aside>

        {/* Problems and Contests with hover/popover */}
        <div className="card glass profile-form animate-right">
          <h3 className="card-title">Public Contributions</h3>
          <br />

          <ExpandableSection
            title="Problems"
            items={problems}
            emptyText="No problems authored."
            getId={(p, i) => p._id || `problem-${i}`}
            render={(p, i, id) => (
              <Link
                to={`/problems/${id}`}
                key={id}
                className="card glass hover-lift"
                onPointerEnter={(e) => handleEnter(e, id, { ...p, type: "problems" })}
                onPointerLeave={handleLeave}
                onClick={(e) => handleClick(e, id, { ...p, type: "problems" })}
              >
                <div className="card-head">
                  <span className="badge code">{p.code || `P${i + 1}`}</span>
                  <span className={`pill ${p.difficulty?.toLowerCase() || "unknown"}`}>{p.difficulty || "N/A"}</span>
                </div>
                <h3 className="card-title">{p.title}</h3>
                <p className="card-sub">{(p.tags || []).map((t, j) => <span className="tag" key={j}>#{t}</span>)}</p>
                <br/>
                <span className="pill">Created: {new Date(p.createdAt).toLocaleString("en-GB")}</span>
              </Link>
            )}
          />

          <ExpandableSection
            title="Contests"
            items={contests}
            emptyText="No contests hosted."
            getId={(c, i) => c._id || `contest-${i}`}
            render={(c, i, id) => (
              <Link
                to={`/contests/${id}`}
                key={id}
                className="card glass hover-lift"
                onPointerEnter={(e) => handleEnter(e, id, { ...c, type: "contests" })}
                onPointerLeave={handleLeave}
                onClick={(e) => handleClick(e, id, { ...c, type: "contests" })}
              >
                <div className="card-head">
                  <span className="badge code">{c.code || `C${i + 1}`}</span>
                  <span className={`pill ${c.status?.toLowerCase() || "unknown"}`}>{c.status || "Unknown"}</span>
                </div>
                <h3 className="card-title">{c.title}</h3>
                <p className="card-sub">{(c.tags || []).map((t, j) => <span className="tag" key={j}>#{t}</span>)}</p>
                <br/>
                <span className="pill">Start: {new Date(c.startDate).toLocaleString("en-GB")}</span>
              </Link>
            )}
          />
        </div>

        {openId && anchorRect && openItem && (
          <GenericPopover
            item={openItem}
            anchorRect={anchorRect}
            openMode={openMode}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
            onClose={() => { cancelClose(); scheduleClose(0); }}
          />
        )}

        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </div>
  );
}

function ExpandableSection({ title, items, render, getId, emptyText }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 2);

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: "16px 0" }}>{title}</h3>
        {items.length > 2 && (
          <button className="btn glossy ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? "See Less 🔼" : "See All 🔽"}
          </button>
        )}
      </div>
      <div className="grid cols-3 cards">
        {visibleItems.map((item, i) => render(item, i, getId(item, i)))}
        {items.length === 0 && (
          <p style={{ marginTop: 16, textAlign: "center", color: "#6b7280" }}>{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function GenericPopover({ item, anchorRect, openMode, onClose, onPointerEnter, onPointerLeave }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(true), []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    const onScroll = () => onClose?.();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onClose]);

  if (!item || !anchorRect) return null;
  const { style, placement } = computePopoverPosition(anchorRect);

  return createPortal(
    <>
      <div
        className={`popover-backdrop ${open ? "open" : ""}`}
        onClick={openMode === "click" ? onClose : undefined}
        style={{ pointerEvents: openMode === "click" ? "auto" : "none" }}
      />
      <div
        className={`popover ${open ? "open" : ""}`}
        data-placement={placement}
        style={style}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div className="popover-head">
          <span className="badge code">{item.code || "Preview"}</span>
        </div>
        <h3 className="popover-title">{item.title || item.problemTitle}</h3>
        <div className="popover-desc">
          {(item.description || "").split("\n").map((line, i) => <p key={i}>{line}</p>)}
        </div>
        <div className="popover-tags">
          {(item.tags || []).map((t, i) => <span className="tag" key={i}>#{t}</span>)}
        </div>
        <div className="popover-actions">
          <Link to={`/${item.type}/${item._id || item.id}`} className="btn small primary">
            Open →
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
}

function computePopoverPosition(rect) {
  const gap = 10;
  const width = Math.min(420, window.innerWidth - 24);
  const estimatedHeight = 260;
  const preferredTop = rect.bottom + gap;
  const preferredLeft = rect.left + rect.width / 2 - width / 2;

  let top = preferredTop;
  let placement = "bottom";
  if (preferredTop + estimatedHeight > window.innerHeight) {
    top = Math.max(12, rect.top - gap - estimatedHeight);
    placement = "top";
  }
  const left = Math.max(12, Math.min(preferredLeft, window.innerWidth - width - 12));
  return { style: { position: "fixed", top, left, width, zIndex: 1000 }, placement };
}


function getVerdictColor(verdict) {
  if (!verdict) return "unknown";
  const v = verdict.toLowerCase();
  if (v.includes("accepted")) return "easy";
  if (v.includes("wrong") || v.includes("error")) return "hard";
  if (v.includes("time") || v.includes("memory")) return "medium";
  return "unknown";
}