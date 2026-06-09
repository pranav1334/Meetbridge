import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setStats(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Admin can manage communities, join requests, meetups, attendance, and
        analytics.
      </p>

      {error && <div className="error">{error}</div>}

      <div className="admin-actions">
        <Link to="/admin/create-community" className="primary-btn">
          Create Community
        </Link>
        <Link to="/admin/join-requests" className="secondary-btn">
          Join Requests
        </Link>
        <Link to="/admin/create-meetup" className="secondary-btn">
          Create Meetup
        </Link>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h2>{stats.total_users}</h2>
            <p>Total Users</p>
          </div>

          <div className="stat-card">
            <h2>{stats.total_communities}</h2>
            <p>Total Communities</p>
          </div>

          <div className="stat-card">
            <h2>{stats.pending_requests}</h2>
            <p>Pending Requests</p>
          </div>

          <div className="stat-card">
            <h2>{stats.total_meetups}</h2>
            <p>Total Meetups</p>
          </div>

          <div className="stat-card">
            <h2>{stats.total_registrations}</h2>
            <p>Meetup Registrations</p>
          </div>

          <div className="stat-card">
            <h2>{stats.total_checkins}</h2>
            <p>Total Check-ins</p>
          </div>

          <div className="stat-card">
            <h2>{stats.total_join_requests}</h2>
            <p>Total Join Requests</p>
          </div>

          <div className="stat-card">
            <h2>{stats.approved_requests}</h2>
            <p>Approved Members</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;