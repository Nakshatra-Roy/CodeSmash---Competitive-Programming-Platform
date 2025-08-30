import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import "./style.css";

function useFetch(url, initial = []) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!url) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const json = await res.json();
        const parsed = Array.isArray(json) ? json : json.items || [];
        if (alive) setData(parsed);
      } catch (e) {
        if (alive) setError(e.message);
        console.error("Fetch error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [url]);

  return { data, loading, error };
}

function Landing() {
  const { data: problems, loading: loadingProblems } = useFetch(
  "https://localhost:5000" ? `/api/problems` : null,
  []
);

  const { data: board, loading: loadingBoard } = useFetch(
    "/api/users",
    []
  );

  const topProblems = useMemo(() => {
    const arr = Array.isArray(problems) ? problems : [];
    return [...arr]
      .sort((a, b) => {
        const diff = (b.submissions || 0) - (a.submissions || 0);
        return diff !== 0 ? diff : new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 6);
  }, [problems]);


  const topBoard = useMemo(() => {
    if (!Array.isArray(board)) return [];
    const filtered = board.filter(u => u.role !== "admin");
    filtered.forEach(u => {
      u.score = u.score ?? (
        (u.contests?.length || 0) +
        (u.contestEnroll?.length || 0) +
        (u.problems?.length || 0) +
        (u.submissions?.length || 0)
      );
    });
    return filtered.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [board]);

  return (
    <>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <section className="section hero">
        <div className="container">
          <div className="hero-inner">
            <div className="eyebrow">Competitive Programming, Reimagined</div>
            <h1 className="hero-title">
              Conquer the <span className="shine">leaderboard</span>. Craft the <span className="shine"> perfect</span> solution.
            </h1>
            <p className="hero-sub">
              Tackle curated problems, battle in live contests, and climb a blazing-fast global leaderboard.
              Write code that feels like art—and watch your rating soar.
            </p>
            <div className="hero-actions">
              <Link to="/problems" className="btn glossy primary">Browse Problems</Link>
              <Link to="/submissions" className="btn glossy ghost">My Submissions</Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">⏱️</div>
                <div className="stat-label">Low-latency judging</div>
              </div>
              <div className="stat">
                <div className="stat-number">🏷️</div>
                <div className="stat-label">Rich tags & editorials</div>
              </div>
              <div className="stat">
                <div className="stat-number">🏆</div>
                <div className="stat-label">Global leaderboard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending problems */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Trending problems</h2>
            <Link to="/problems" className="btn tiny ghost">View all →</Link>
          </div>
          <div className="grid cards cols-3">
            {(loadingProblems ? Array.from({ length: 6 }) : topProblems).map((p, i) => (
              <Link
                to={`/problems/${p?.slug || p?._id || p?.id || "#"}`}
                className={`card glass hover-lift ${loadingProblems ? "skeleton" : ""}`}

                key={p?._id || p?.id || i}>
                <div className="card-head">
                  <span className="badge code">{(p?.code || p?.shortId || "P" + (i + 1)).toString()}</span>
                 <span className={`pill ${p?.difficulty.toLowerCase() || "unknown"}`}>{p?.difficulty || "Unknown"}</span>
                </div>
                <h3 className="card-title">{p?.title || "Loading…"}</h3>
                <p className="card-sub">
                  {(p?.tags || ["arrays", "dp", "graphs"]).slice(0, 3).map((t, j) => (
                    <span className="tag" key={j}>#{t}</span>
                  ))}
                </p>
                <br/>
                <span className="badge code">Submissions: {p?.submissions}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard preview */}
      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>Leaderboard</h2>
            <Link to="/profile" className="btn tiny ghost">Your profile →</Link>
          </div>
          <div className="card glass">
            <div className="table">
              <div className="row leaderboard head">
                <div>#</div>
                <div>Username</div>
                <div>Contests Hosted</div>
                <div>Contests Enrolled</div>
                <div>Problems Written</div>
                <div>Problems Solved</div>
                <div>Score</div>
              </div>
              {(loadingBoard ? Array.from({ length: 8 }) : topBoard).map((r, i) => (
                <div className={`row leaderboard ${loadingBoard ? "skeleton" : ""}`} key={r?.userId || r?.handle || i}>
                  <div>{i + 1}</div>
                  <a
                  href={`/users/${r?._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn tiny ghost"
                  style={{
                    padding: "4px 12px",
                    fontSize: "1rem",
                    textAlign: "left",
                    justifyContent: "flex-start",
                  }}
                >
                    <span>{r?.handle || r?.username || "Loading…"}</span>
                  </a>
                  <div>{r?.contests.length ?? "—"}</div>
                  <div>{r?.contestEnroll.length ?? "—"}</div>
                  <div>{r?.problems.length ?? "—"}</div>
                  <div>{r?.submissions.length ?? "—"}</div>
                  <div>{r?.score ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section">
        <div className="container">
          <div className="grid cols-2 about">
            <div>
              <h2>Built for flow, tuned for speed</h2>
              <p>
                From crisp problem statements to blazing judgement, every pixel and millisecond is crafted
                to keep you in the zone. Tag filters, difficulty ladders, clean editorials, and a global
                rating that reflects the grind—you focus on ideas, we handle the rest.
              </p>
              <div className="bullets">
                <div>⚡ Real-time verdicts and submission history</div>
                <div>🧭 Smart search by tags, difficulty, or ID</div>
                <div>🧩 Editorial links and constraint highlights</div>
                <div>🌐 Ongoing/upcoming contests with standings</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Link to="/problems" className="btn glossy primary">Start solving</Link>
                <Link to="/submissions" className="btn glossy ghost" style={{ marginLeft: 8 }}>Review submissions</Link>
              </div>
            </div>
            <div className="card glass highlight">
              <h3 className="card-title">Tip: Build your ladder</h3>
              <p className="card-sub">
                Pick a tag, start easy, climb to medium, then hard. Iterate fast, learn patterns,
                and revisit with fresh eyes. Simple. Relentless. Effective.
              </p>
              <div className="ladder">
                <div className="rung easy">Easy</div>
                <div className="rung medium">Medium</div>
                <div className="rung hard">Hard</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="foot-inner">
            <div className="brand">CODESMASH</div>
            <div className="muted">Code. Learn. Compete.</div>
          </div>
        </div>
      </footer>
      </>
  );
}
export default Landing;