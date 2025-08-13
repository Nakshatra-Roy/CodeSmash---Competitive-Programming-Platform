import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import "./Problems.css";

const CLOSE_DELAY = 220; // Slightly longer to allow cursor travel from card to popover

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unified hover/click popover state
  const [activeId, setActiveId] = useState(null); // which card is active (hover/focus)
  const [openId, setOpenId] = useState(null); // which popover is currently open
  const [openMode, setOpenMode] = useState(null); // 'hover' | 'click' | null
  const [anchorRect, setAnchorRect] = useState(null);
  const [openProblem, setOpenProblem] = useState(null);

  const closeTimerRef = useRef(null);

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

  const getId = (p, i) => p?._id || p?.id || `p-${i}`;

  const cancelClosePopover = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
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
  const hoverTimerRef = useRef(null);

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

  hoverTimerRef.current = setTimeout(() => {
    openPopover(id, rect, problem, "hover");
  }, 500);
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

  const handleCardBlur = () => {
    scheduleClosePopover();
  };

  const handleCardClick = (e, id, problem) => {
    // First click opens popover (especially on touch); second click navigates
    if (openId !== id) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      openPopover(id, rect, problem, "click");
    }
  };

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
          <h2>
            This is it. Conquer it all. <br />
            Forge the perfect solution.
          </h2>
          <Link to="/" className="btn tiny ghost">
            ← Home
          </Link>
        </div>

        <div className="grid cols-3 cards">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="card glass hover-lift skeleton" key={i} style={{ height: 180 }} />
              ))
            : problems.map((p, i) => {
                const id = getId(p, i);

                return (
                  <Link
                    to={`/problems/${id}`}
                    key={id}
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

                    {/* Note: no in-card description to avoid layout shift */}
                    <p className="card-sub">
                      {(p.tags || []).map((tag, j) => (
                        <span className="tag" key={j}>
                          #{tag}
                        </span>
                      ))}
                    </p>

                    {/* Optional subtle indicator */}
                    <span className="hint">Hover or tap for preview</span>
                  </Link>
                );
              })}
        </div>

        {/* Popover portal */}
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
    </div>
  );
};

export default Problems;

/* ----------------- Popover component ----------------- */

function ProblemPopover({
  problem,
  anchorRect,
  openMode,
  onClose,
  onPointerEnter,
  onPointerLeave,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const onScrollOrResize = () => {
      // Close on page movement to avoid misplacement
      onClose?.();
    };
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
      {/* Backdrop only interactive when opened via click; non-interactive for hover to prevent hover flicker */}
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
          <span className="badge code">{problem.code || "Preview"}</span>
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
  const estimatedHeight = 260; // rough height to decide top/bottom placement
  const preferredTop = rect.bottom + gap;
  const preferredLeft = rect.left + rect.width / 2 - width / 2;

  let top = preferredTop;
  let placement = "bottom";
  if (preferredTop + estimatedHeight > window.innerHeight) {
    top = Math.max(12, rect.top - gap - estimatedHeight);
    placement = "top";
  }

  const left = Math.max(12, Math.min(preferredLeft, window.innerWidth - width - 12));

  return {
    style: {
      position: "fixed",
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(width)}px`,
      zIndex: 1000,
    },
    placement,
  };
}