import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ContestFilters from "../components/ContestFilters";
import { createPortal } from "react-dom";
import { useAuth } from "../context/authContext";

const CLOSE_DELAY = 220;

const Contests = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [openMode, setOpenMode] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [openContest, setOpenContest] = useState(null);


  const [filters, setFilters] = useState({
    search: "",
    tag: "",
    organizer: "",
    startDate: "",
    showMine: false,
  });

  const closeTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);

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

  const allTags = useMemo(() => [...new Set(contests.flatMap(c => c.tags || []))], [contests]);
  const allOrganizers = useMemo(() => [...new Set(contests.map(c => c.organizer).filter(Boolean))], [contests]);

  const filteredContests = useMemo(() => {
    const s = filters.search?.trim().toLowerCase();
    const sd = filters.startDate ? new Date(filters.startDate) : null;

    return contests.filter(c => {
      if (filters.showMine) {
        if (!c.authors?.includes(user?._id)) return false;
      } else {
        if (c.status === "Pending" || c.status === "Rejected") return false;
      }
      const matchSearch = !s || (c.title.toLowerCase().includes(s) || (c.description || "").toLowerCase().includes(s));
      const matchTag = !filters.tag || (c.tags || []).includes(filters.tag);
      const matchOrganizer = !filters.organizer || c.organizer === filters.organizer;
      const matchStartDate = !sd || new Date(c.startTime) >= sd;

      return matchSearch && matchTag && matchOrganizer && matchStartDate;
    });
  }, [contests, filters, user]);


  const getId = (c, i) => c?._id || c?.id || `c-${i}`;

  const cancelClosePopover = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

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
    hoverTimerRef.current = setTimeout(() => openPopover(id, rect, contest, "hover"), 800);
  };

  const handleCardPointerLeave = () => {
    setActiveId(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    scheduleClosePopover();
  };

  const handleCardFocus = (e, id, contest) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveId(id);
    openPopover(id, rect, contest, "hover");
  };

  const handleCardBlur = () => scheduleClosePopover();

  const handleCardClick = (e, id, contest) => {
    if (openId !== id) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      openPopover(id, rect, contest, "click");
    }
  };

  const handleReset = () => setFilters({ search: "", tag: "", organizer: "", startDate: "", showMine: false });

  const handleShowMine = () => setFilters(prev => ({ ...prev, showMine: !prev.showMine }));

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "32px 0" }}>
        <div className="section-head">
          <h2>History is written here. Carve yours in stone.
            <br/>
            Face the ultimate battle.
          </h2>
          <Link to="/" className="btn tiny ghost">← Home</Link>
          <Link to="/contests/new" className="btn glossy primary">📝 Create Contest</Link>
        </div>

        {/* Filters */}
        <ContestFilters
          onFilterChange={setFilters}
          allTags={allTags}
          allOrganizers={allOrganizers}
          extraButtons={
            <>
              <button className="btn small ghost" onClick={handleReset}>Reset</button>
              {user && (
              <button
                className={`btn small ghost${filters.showMine ? " active" : ""}`}
                onClick={handleShowMine}
              >
                My Contests
              </button>
              )}
            </>
          }
          filters={filters}
        />

        <div className="grid cols-3 cards">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="card glass hover-lift skeleton" key={i} style={{ height: 180 }} />
              ))
            : filteredContests.map((c, i) => {
                const id = getId(c, i);
                return (
                  <Link
                    to={`/contests/${id}`}
                    key={id}
                    className="card glass hover-lift"
                    style={{ textDecoration: "none", color: "inherit" }}
                    onPointerEnter={(e) => handleCardPointerEnter(e, id, c)}
                    onPointerLeave={handleCardPointerLeave}
                    onFocus={(e) => handleCardFocus(e, id, c)}
                    onBlur={handleCardBlur}
                    onClick={(e) => handleCardClick(e, id, c)}
                  >
                    <div className="card-head">
                      <span className="badge code">{c.code || `C${i + 1}`}</span>
                      <span className={`pill ${c.status?.toLowerCase() || "unknown"}`}>{c.status || "Unknown"}</span>
                    </div>
                    <h3 className="card-title">{c.title}</h3>
                    <p className="card-sub">{(c.tags || []).map((t, j) => <span className="tag" key={j}>#{t}</span>)}</p>
                    <span className="hint">Hover or tap for preview</span>
                  </Link>
                );
              })}
          {!loading && filteredContests.length === 0 && (
            <p style={{ marginTop: 16, textAlign: "center", color: "#6b7280" }}>No contests found.</p>
          )}
        </div>

        {/* Original Popover */}
        {openId && anchorRect && openContest && (
          <ContestPopover
            contest={openContest}
            anchorRect={anchorRect}
            openMode={openMode}
            onPointerEnter={cancelClosePopover}
            onPointerLeave={scheduleClosePopover}
            onClose={() => { cancelClosePopover(); scheduleClosePopover(0); }}
          />
        )}
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
};

export default Contests;

// --- Popover component remains the same ---
function ContestPopover({ contest, anchorRect, openMode, onClose, onPointerEnter, onPointerLeave }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(true), []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    const onScrollOrResize = () => { onClose?.(); };
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
          {(contest.description || "").split("\n").map((line, i) => <p key={i}>{line}</p>)}
        </div>
        <div className="popover-tags">
          {(contest.tags || []).map((t, i) => <span className="tag" key={i}>#{t}</span>)}
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

  return {
    style: { position: "fixed", top: `${Math.round(top)}px`, left: `${Math.round(left)}px`, width: `${Math.round(width)}px`, zIndex: 1000 },
    placement,
  };
}