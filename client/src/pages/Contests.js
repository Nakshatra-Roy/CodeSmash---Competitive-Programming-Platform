import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import "./Problems.css";

const CLOSE_DELAY = 220; // Slightly longer to allow cursor travel from card to popover

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unified hover/click popover state
  const [activeId, setActiveId] = useState(null); // which card is active (hover/focus)
  const [openId, setOpenId] = useState(null); // which popover is currently open
  const [openMode, setOpenMode] = useState(null); // 'hover' | 'click' | null
  const [anchorRect, setAnchorRect] = useState(null);
  const [openContest, setOpenContest] = useState(null);

  const closeTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contests")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setContests(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContests([]);
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
  const hoverTimerRef = useRef(null);


  const scheduleClosePopover = (delay = CLOSE_DELAY) => {
    cancelClosePopover();
    closeTimerRef.current = setTimeout(() => {
      setOpenId(null);
      setOpenContest(null);
      setAnchorRect(null);
      setOpenMode(null);
    }, delay);
  };

  const openPopover = (id, rect, contest, mode = "hover") => {
    cancelClosePopover();
    setOpenMode(mode);
    setOpenId(id);
    setOpenContest(contest || null);
    setAnchorRect(rect || null);
  };

  const handleCardPointerEnter = (e, id, contest) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setActiveId(id);

  hoverTimerRef.current = setTimeout(() => {
    openPopover(id, rect, contest, "hover");
  }, 800); 
};


  const handleCardPointerLeave = () => {
  setActiveId(null);

  if (hoverTimerRef.current) {
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  }

  scheduleClosePopover();
};


  const handleCardFocus = (e, id, contest) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveId(id);
    openPopover(id, rect, contest, "hover");
  };

  const handleCardBlur = () => {
    scheduleClosePopover();
  };

  const handleCardClick = (e, id, contest) => {
    // First click opens popover (especially on touch); second click navigates
    if (openId !== id) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      openPopover(id, rect, contest, "click");
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
            History is written here. Carve yours in stone. <br />
            Face the ultimate battle.
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
            : contests.map((p, i) => {
                const id = getId(p, i);

                return (
                  <Link
                    to={`/contests/${id}`}
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
                      <span className="badge code">{p.code || `C${i + 1}`}</span>
                      <span className={`pill ${p.status?.toLowerCase() || "unknown"}`}>
                        {p.status || "Unknown"}
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
        {openId && anchorRect && openContest && (
          <ContestPopover
            contest={openContest}
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

export default Contests;

/* ----------------- Popover component ----------------- */

function ContestPopover({
  contest,
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

  if (!contest || !anchorRect) return null;

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
        aria-label="Contest preview"
      >
        <div className="popover-head">
          <span className="badge code">{contest.code || "Preview"}</span>
          <span className={`pill ${contest.status?.toLowerCase() || "unknown"}`}>
            {contest.status || "Unknown"}
          </span>
        </div>
        <h3 className="popover-title">{contest.title}</h3>
        <div className="popover-desc">
  {contest.description.split("\n").map((line, index) => (
    <p key={index}>{line}</p>
  ))}
</div>




        <div className="popover-tags">
          {(contest.tags || []).map((tag, i) => (
            <span className="tag" key={i} style={{ "--i": i }}>
              #{tag}
            </span>
          ))}
        </div>

        <div className="popover-actions">
          <Link to={`/contests/${contest._id || contest.id}`} className="btn small primary">
            Open contest →
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