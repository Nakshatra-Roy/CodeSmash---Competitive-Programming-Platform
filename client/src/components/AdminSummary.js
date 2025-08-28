import React from 'react';

const AdminSummary = ({ stats }) => {
    if (!stats) return null;

    const { users, problems, submissions, contests } = stats;

    return (
        <div>
            <h2 className="card-title">Platform Summary</h2>
            <div className="summary-stats-grid">
                <div className="card glass hover-lift">
                    <div className="stat-value">{users.userTotal}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{users.adminTotal}</div>
                    <div className="stat-label">Total Admins</div>
                </div>

                <div className="card glass hover-lift">
                    <div className="stat-value">{problems.total}</div>
                    <div className="stat-label">Total Problems</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{problems.pending}</div>
                    <div className="stat-label">Pending Problems</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{problems.approved}</div>
                    <div className="stat-label">Approved Problems</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{problems.rejected}</div>
                    <div className="stat-label">Rejected Problems</div>
                </div>

                 <div className="card glass hover-lift">
                    <div className="stat-value">{submissions.total}</div>
                    <div className="stat-label">Total Submissions</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{submissions.pending}</div>
                    <div className="stat-label">Pending Submissions</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{submissions.accepted}</div>
                    <div className="stat-label">Accepted Submissions</div>
                </div>

                <div className="card glass hover-lift">
                    <div className="stat-value">{contests.total}</div>
                    <div className="stat-label">Total Contests</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{contests.pending}</div>
                    <div className="stat-label">Pending Contests</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{contests.rejected}</div>
                    <div className="stat-label">Rejected Contests</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{contests.upcoming}</div>
                    <div className="stat-label">Upcoming Contests</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{contests.ongoing}</div>
                    <div className="stat-label">Ongoing Contests</div>
                </div>
                <div className="card glass hover-lift">
                    <div className="stat-value">{contests.completed}</div>
                    <div className="stat-label">Completed Contests</div>
                </div>

            </div>
        </div>
    );
};

export default AdminSummary;