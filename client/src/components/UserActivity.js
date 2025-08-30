import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { createPortal } from "react-dom";
import { useAuth } from "../context/authContext";

const CLOSE_DELAY = 220;

export default function UserActivity({ userId }) {
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [enrolledContests, setEnrolledContests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openId, setOpenId] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [openMode, setOpenMode] = useState(null);

  const closeTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        const [allProblems, allContests, allSubs] = await Promise.all([
          axios.get("/api/problems"),
          axios.get("/api/contests"),
          axios.get("/api/submissions"),
        ]);

        if (cancelled) return;

        const myProblems = (allProblems.data || []).filter(p => p.author?._id === userId);
        const myContests = (allContests.data || []).filter(c =>
          Array.isArray(c.authors) && c.authors?.includes(userId)
        );
        const myEnrolled = (allContests.data || []).filter(c =>
          Array.isArray(c.participants) && c.participants?.includes(userId)
        );
        const mySubs = (allSubs.data || []).filter(s => s.user?.id === userId);

        setProblems(myProblems);
        setContests(myContests);
        setEnrolledContests(myEnrolled);
        setSubmissions(mySubs);
      } catch (err) {
        console.error("Error fetching user activity:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchActivity();
    return () => {
      cancelled = true;
      clearTimeout(closeTimerRef.current);
      clearTimeout(hoverTimerRef.current);
    };
  }, [userId]);

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

  if (loading) {
    return (
      <div className="grid cols-3 cards">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card glass hover-lift skeleton" style={{ height: 180 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <h2 style={{ marginBottom: 24 }}>My Activity</h2>

        {/* Submissions */}
        <ExpandableSection
        title="My Submissions"
        items={submissions}
        emptyText="No submissions yet."
        getId={(s, i) => s._id || `sub-${i}`}
        render={(s, i, id) => (
            <div
            key={id}
            className="card glass hover-lift"
            >
            <div className="card-head">
                <span className="badge code">{s.language?.toUpperCase() || "LANG"}</span>
                <span className={`pill ${getVerdictColor(s.verdict)}`}>
                {s.verdict || "Pending"}
                </span>
            </div>

            <h3 className="card-title">{s.problem || "Untitled Problem"}</h3>
            <p className="card-sub">
                <span className="tag">🕑 Time: {s.time || "N/A"}ms</span>
                <span className="tag">💾 Memory: {s.memory || "N/A"}KB</span>
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn tiny glossy ghost">🛠️ Rejudge</button>
                <Link to={`/submissions/${s._id || s.id}`} className="btn tiny glossy ghost">
                📊 Report
                </Link>
            
            </div>
            <br/>
            <span className="pill">Submitted: {new Date(s.createdAt).toLocaleString("en-GB")}</span>
            </div>
        )}
        />

        {/* Enrolled Contests */}
      <ExpandableSection
        title="Contest History"
        items={enrolledContests}
        emptyText="No enrolled contests."
        getId={(c, i) => c._id || `enrolled-${i}`}
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
              <span className={`pill ${c.status?.toLowerCase() || "unknown"}`}>
                {c.status || "Unknown"}
              </span>
            </div>
            <h3 className="card-title">{c.title}</h3>
            <p className="card-sub">{(c.tags || []).map((t, j) => <span className="tag" key={j}>#{t}</span>)}</p>
            <br/>
            <span className="pill">Start: {new Date(c.startTime).toLocaleString("en-GB")}</span> <span className="pill">🕑 {c.duration} minutes</span>
          </Link>
        )}
      />

      {/* Hosted Contests */}
      <ExpandableSection
        title="My Contests"
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
              <span className={`pill ${c.status?.toLowerCase() || "unknown"}`}>
                {c.status || "Unknown"}
              </span>
            </div>
            <h3 className="card-title">{c.title}</h3>
            <p className="card-sub">{(c.tags || []).map((t, j) => <span className="tag" key={j}>#{t}</span>)}</p>
             <br/>
            <span className="pill">Created: {new Date(c.createdAt).toLocaleString("en-GB")}</span>
          </Link>
        )}
      />


      {/* Problems */}
      <ExpandableSection
        title="My Problems"
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
              <span className={`pill ${p.difficulty?.toLowerCase() || "unknown"}`}>
                {p.difficulty || "N/A"}
              </span>
            </div>
            <h3 className="card-title">{p.title}</h3>
            <p className="card-sub">{(p.tags || []).map((t, j) => <span className="tag" key={j}>#{t}</span>)}</p>
            <br/>
            <span className="pill">Created: {new Date(p.createdAt).toLocaleString("en-GB")}</span>
          </Link>
        )}
      />

      {/* Popover */}
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
