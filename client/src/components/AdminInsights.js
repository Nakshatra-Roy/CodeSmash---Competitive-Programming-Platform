// client/src/components/AdminInsights.js
import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#f87171"];

const AdminInsights = ({ stats, compact }) => {
  if (!stats) return null;

  const userData = [
    { name: "Users", value: stats.users.userTotal },
    { name: "Admins", value: stats.users.adminTotal }
  ];

  const problemData = [
    { name: "Pending", value: stats.problems.pending },
    { name: "Approved", value: stats.problems.approved },
    { name: "Rejected", value: stats.problems.rejected }
  ];

  const submissionData = [
    { name: "Accepted", value: stats.submissions.accepted },
    { name: "Pending", value: stats.submissions.pending },
    { name: "Wrong", value: stats.submissions.wrong },
    { name: "Runtime Error", value: stats.submissions.runtime },
    { name: "Time Limit", value: stats.submissions.timelimit }
  ];

  const contestData = [
    { name: "Upcoming", value: stats.contests.upcoming },
    { name: "Ongoing", value: stats.contests.ongoing },
    { name: "Completed", value: stats.contests.completed },
    { name: "Pending", value: stats.contests.pending },
    { name: "Rejected", value: stats.contests.rejected }
  ];

  const h = compact ? 200 : 250;
  return (
    <div className="admin-insights">
      <h2 className="text-xl font-semibold mb-4">📊 Platform Insights</h2>

        <div className="pie-charts-row">
        <div className="card glass hover-lift">
            <h3 className="mb-2">User Roles</h3>
            <ResponsiveContainer width="100%" height={h}>
            <PieChart>
                <Pie data={userData} dataKey="value" nameKey="name" outerRadius={80} label>
                {userData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Problems Pie */}
        <div className="card glass hover-lift">
            <h3 className="mb-2">Problems Status</h3>
            <ResponsiveContainer width="100%" height={h}>
            <PieChart>
                <Pie data={problemData} dataKey="value" nameKey="name" outerRadius={80} label>
                {problemData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            </ResponsiveContainer>
        </div>
        </div>

        <div className="insights-grid">
        {/* Submissions Bar */}
        <div className="card glass hover-lift">
            <h3 className="mb-2">Submissions Overview</h3>
            <ResponsiveContainer width="100%" height={h}>
            <BarChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>

                <br/>
      {/* Quick Facts */}
      <div className="card glass hover-lift mt-6">
        <h3 className="mb-2">📌 Quick Facts</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>Total platform users: <strong>{stats.users.userTotal + stats.users.adminTotal}</strong></li>
          <li>Problem approval rate: <strong>{((stats.problems.approved / stats.problems.total) * 100).toFixed(1)}%</strong></li>
          <li>Submission acceptance rate: <strong>{((stats.submissions.accepted / stats.submissions.total) * 100).toFixed(1)}%</strong></li>
          <li>Active contests (Ongoing + Upcoming): <strong>{stats.contests.ongoing + stats.contests.upcoming}</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminInsights;