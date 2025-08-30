import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ProblemFilters from "../components/ProblemFilters";
import { useAuth } from "../context/authContext";
import { createPortal } from "react-dom";

const CLOSE_DELAY = 220;

const Problems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", difficulty: "", tag: "", showMine: false });

  const [activeId, setActiveId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [openMode, setOpenMode] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [openProblem, setOpenProblem] = useState(null);
  const closeTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/problems")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setProblems(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProblems([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(closeTimerRef.current);
      clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const allDifficulties = useMemo(() => [...new Set(problems.map((p) => p.difficulty).filter(Boolean))], [problems]);
  const allTags = useMemo(() => [...new Set(problems.flatMap((p) => p.tags || []))], [problems]);

  const filteredProblems = useMemo(() => {
  const s = filters.search?.trim().toLowerCase();

  return problems.filter((p) => {
    if (filters.showMine) {
      if (p.author?._id !== user?._id) return false;
    } else {
      if (p.status !== "Approved") return false;
    }

    const matchSearch =
      !s ||
      p.title.toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s);

    const matchDifficulty = !filters.difficulty || p.difficulty === filters.difficulty;
    const matchTag = !filters.tag || (p.tags || []).includes(filters.tag);

    return matchSearch && matchDifficulty && matchTag;
  });
}, [problems, filters, user]);


  const getId = (p, i) => p?._id || p?.id || `p-${i}`;

  const cancelClosePopover = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };
  const scheduleClosePopover = (delay = CLOSE_DELAY) => {
    cancelClosePopover();
    closeTimerRef.current = setTimeout(() => {
      setOpenId(null);
      setOpenProblem(null);
      setAnchorRect(null);
      setOpenMode(null);
    }, delay);
  };
  const openPopover = (id, rect, problem, mode = "hover") => {
    cancelClosePopover();
    setOpenMode(mode);
    setOpenId(id);
    setOpenProblem(problem || null);
    setAnchorRect(rect || null);
  };

  const handleCardPointerEnter = (e, id, problem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveId(id);
    hoverTimerRef.current = setTimeout(() => openPopover(id, rect, problem, "hover"), 500);
  };
  const handleCardPointerLeave = () => {
    setActiveId(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    scheduleClosePopover();
  };
  const handleCardFocus = (e, id, problem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveId(id);
    openPopover(id, rect, problem, "hover");
  };
  const handleCardBlur = () => scheduleClosePopover();
  const handleCardClick = (e, id, problem) => {
    if (openId !== id) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      openPopover(id, rect, problem, "click");
    }
  };

  const handleShowMine = () => setFilters((prev) => ({ ...prev, showMine: !prev.showMine }));

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "32px 0" }}>
        <div className="section-head">
          <h2> This is it. Conquer it all. <br /> Forge the perfect solution. </h2>
          <Link to="/" className="btn tiny ghost">
            ← Home
          </Link>
          <Link to="/problems/new" className="btn glossy primary">
            📝 Create Problem
          </Link>
        </div>

        <ProblemFilters
          onFilterChange={setFilters}
          filters={filters}
          allDifficulties={allDifficulties}
          allTags={allTags}
          extra
        />

        <div className="grid cols-3 cards">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card glass hover-lift skeleton" style={{ height: 180 }} />
              ))
            : filteredProblems.map((p, i) => {
                const id = getId(p, i);
                return (
                  <Link
                    key={id}
                    to={`/problems/${id}`}
                    className="card glass hover-lift"
                    style={{ textDecoration: "none", color: "inherit" }}
                    onPointerEnter={(e) => handleCardPointerEnter(e, id, p)}
                    onPointerLeave={handleCardPointerLeave}
                    onFocus={(e) => handleCardFocus(e, id, p)}
                    onBlur={handleCardBlur}
                    onClick={(e) => handleCardClick(e, id, p)}
                  >
                    <div className="card-head">
                      <span className="badge code">{p.code || `P${i + 1}`}</span>
                      <span className={`pill ${p.difficulty?.toLowerCase() || "unknown"}`}>
                        {p.difficulty || "Unknown"}
                      </span>
                    </div>
                    <h3 className="card-title">{p.title}</h3>
                    <p className="card-sub">
                      {(p.tags || []).map((tag, j) => (
                        <span className="tag" key={j}>
                          #{tag}
                        </span>
                      ))}
                    </p>
                    <span className="hint">Hover or tap for preview</span>
                  </Link>
                );
              })}
          {!loading && filteredProblems.length === 0 && (
            <p style={{ marginTop: 16, textAlign: "center", color: "#6b7280" }}>No problems found.</p>
          )}
        </div>

        {openId && anchorRect && openProblem && (
          <ProblemPopover
            problem={openProblem}
            anchorRect={anchorRect}
            openMode={openMode}
            onPointerEnter={cancelClosePopover}
            onPointerLeave={scheduleClosePopover}
            onClose={() => {
              cancelClosePopover();
              scheduleClosePopover(0);
            }}
          />
        )}
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
};

export default Problems;

// ---------------- ProblemPopover Component----------------
function ProblemPopover({ problem, anchorRect, openMode, onClose, onPointerEnter, onPointerLeave }) {
  const [open, setOpen] = useState(false);

  React.useEffect(() => setOpen(true), []);
  React.useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onScrollOrResize = () => onClose?.();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [onClose]);

  if (!problem || !anchorRect) return null;
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
        role="dialog"
        aria-label="Problem preview"
      >
        <div className="popover-head">
          <span className="badge code">{`by ${problem.author.name}` || "Preview"}</span>
          <span className={`pill ${problem.difficulty?.toLowerCase() || "unknown"}`}>
            {problem.difficulty || "Unknown"}
          </span>
        </div>
        <h3 className="popover-title">{problem.title}</h3>
        <p className="popover-desc">{problem.description}</p>
        <div className="popover-tags">
          {(problem.tags || []).map((tag, i) => (
            <span className="tag" key={i} style={{ "--i": i }}>
              #{tag}
            </span>
          ))}
        </div>
        <span className="badge code">Submissions: {problem.submissions}</span>
        <div className="popover-actions">
          <Link to={`/problems/${problem._id || problem.id}`} className="btn small primary">
            Open problem →
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
  let top = rect.bottom + gap;
  let placement = "bottom";
  if (top + estimatedHeight > window.innerHeight) {
    top = Math.max(12, rect.top - gap - estimatedHeight);
    placement = "top";
  }
  const left = Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12));
  return { style: { position: "fixed", top: `${Math.round(top)}px`, left: `${Math.round(left)}px`, width: `${Math.round(width)}px`, zIndex: 1000 }, placement };
}
