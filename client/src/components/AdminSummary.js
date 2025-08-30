import React from "react";

const StatCard = ({ value, label }) => (
  <div className="card glass hover-lift">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const AdminSummary = ({ stats }) => {
  if (!stats) return null;

  const { users, problems, submissions, contests } = stats;

  return (
    <div>
      <div className="text-xl font-semibold mb-4">
        <h2>Platform Summary</h2>
      </div>

      <div className="summary-section">
        <h3 className="section-title">👥 Users</h3>
        <div className="summary-stats-grid">
          <StatCard value={users.userTotal} label="Total Users" />
          <StatCard value={users.adminTotal} label="Total Admins" />
        </div>
      </div>

      <div className="summary-section">
        <h3 className="section-title">📚 Problems</h3>
        <div className="summary-stats-grid">
          <StatCard value={problems.total} label="Total Problems" />
          <StatCard value={problems.pending} label="Pending Problems" />
          <StatCard value={problems.approved} label="Approved Problems" />
          <StatCard value={problems.rejected} label="Rejected Problems" />
        </div>
      </div>

      <div className="summary-section">
        <h3 className="section-title">📤 Submissions</h3>
        <div className="summary-stats-grid">
          <StatCard value={submissions.total} label="Total Submissions" />
          <StatCard value={submissions.pending} label="Pending Submissions" />
          <StatCard value={submissions.accepted} label="Accepted Submissions" />
          <StatCard value={submissions.wrong} label="Wrong Submissions" />
          <StatCard value={submissions.runtime} label="Run Time Error Submissions" />
          <StatCard value={submissions.timelimit} label="Time Limit Exceeded Submissions" />
        </div>
      </div>

      <div className="summary-section">
        <h3 className="section-title">🏆 Contests</h3>
        <div className="summary-stats-grid">
          <StatCard value={contests.total} label="Total Contests" />
          <StatCard value={contests.pending} label="Pending Contests" />
          <StatCard value={contests.rejected} label="Rejected Contests" />
          <StatCard value={contests.upcoming} label="Upcoming Contests" />
          <StatCard value={contests.ongoing} label="Ongoing Contests" />
          <StatCard value={contests.completed} label="Completed Contests" />
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
