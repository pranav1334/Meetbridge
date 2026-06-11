import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");

  const [stats, setStats] = useState({
    total_users: 0,
    total_communities: 0,
    pending_requests: 0,
    total_meetups: 0,
    total_registrations: 0,
    total_checkins: 0,
    total_join_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/admin/dashboard");
      setStats(res.data);
    } catch (error) {
      console.log("Admin dashboard error:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else {
        setError(detail || "Failed to load admin dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalJoinRequests = stats.total_join_requests || 0;

  const approvedPercent =
    totalJoinRequests > 0
      ? Math.round((stats.approved_requests / totalJoinRequests) * 100)
      : 0;

  const pendingPercent =
    totalJoinRequests > 0
      ? Math.round((stats.pending_requests / totalJoinRequests) * 100)
      : 0;

  const rejectedPercent =
    totalJoinRequests > 0
      ? Math.round((stats.rejected_requests / totalJoinRequests) * 100)
      : 0;

  const checkInPercent =
    stats.total_registrations > 0
      ? Math.round((stats.total_checkins / stats.total_registrations) * 100)
      : 0;

  return (
    <div className="page admin-dashboard-page">
      <section className="admin-hero">
        <div>
          <span className="admin-badge">Admin Control Center</span>

          <h1>Welcome back, {user?.full_name || "Admin"}</h1>

          <p>
            Manage communities, review join requests, create meetups, monitor
            attendance, and track platform activity from one place.
          </p>

          <div className="admin-hero-actions">
            <Link to="/admin/create-community" className="primary-btn">
              Create Community
            </Link>

            <Link to="/admin/create-meetup" className="secondary-btn">
              Create Meetup
            </Link>

            <Link to="/admin/join-requests" className="secondary-btn">
              Review Requests
            </Link>
          </div>
        </div>

        <div className="admin-hero-card">
          <h3>Platform Status</h3>

          <div className="admin-status-row">
            <span>Total Users</span>
            <strong>{stats.total_users}</strong>
          </div>

          <div className="admin-status-row">
            <span>Communities</span>
            <strong>{stats.total_communities}</strong>
          </div>

          <div className="admin-status-row">
            <span>Meetups</span>
            <strong>{stats.total_meetups}</strong>
          </div>

          <div className="admin-status-row">
            <span>Pending Requests</span>
            <strong>{stats.pending_requests}</strong>
          </div>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="success">
          Loading admin dashboard data...
        </div>
      )}

      <section className="admin-action-grid">
        <Link to="/admin/create-community" className="admin-action-card">
          <div className="admin-action-icon">C</div>
          <h3>Create Community</h3>
          <p>Add a new community with category, rules, city, and links.</p>
        </Link>

        <Link to="/admin/communities" className="admin-action-card">
          <div className="admin-action-icon">M</div>
          <h3>Manage Communities</h3>
          <p>Edit community details, view members, and manage listings.</p>
        </Link>

        <Link to="/admin/join-requests" className="admin-action-card">
          <div className="admin-action-icon">J</div>
          <h3>Join Requests</h3>
          <p>Review AI scores and approve or reject community requests.</p>
        </Link>

        <Link to="/admin/create-meetup" className="admin-action-card">
          <div className="admin-action-icon">E</div>
          <h3>Create Meetup</h3>
          <p>Schedule new meetups with date, venue, capacity, and banner.</p>
        </Link>

        <Link to="/admin/meetups" className="admin-action-card">
          <div className="admin-action-icon">A</div>
          <h3>Meetup Analytics</h3>
          <p>Track registrations, check-ins, and meetup performance.</p>
        </Link>

        <Link to="/members" className="admin-action-card">
          <div className="admin-action-icon">U</div>
          <h3>Manage Members</h3>
          <p>View member profiles, skills, and community participation.</p>
        </Link>
      </section>

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Total Users</span>
          <h2>{stats.total_users}</h2>
          <p>Registered users on the platform</p>
        </div>

        <div className="admin-stat-card">
          <span>Communities</span>
          <h2>{stats.total_communities}</h2>
          <p>Active community spaces</p>
        </div>

        <div className="admin-stat-card warning-stat">
          <span>Pending Requests</span>
          <h2>{stats.pending_requests}</h2>
          <p>Requests waiting for review</p>
        </div>

        <div className="admin-stat-card">
          <span>Total Meetups</span>
          <h2>{stats.total_meetups}</h2>
          <p>Meetups created by admin</p>
        </div>

        <div className="admin-stat-card">
          <span>Registrations</span>
          <h2>{stats.total_registrations}</h2>
          <p>Total meetup registrations</p>
        </div>

        <div className="admin-stat-card">
          <span>Check-ins</span>
          <h2>{stats.total_checkins}</h2>
          <p>Users checked in to meetups</p>
        </div>
      </section>

      <section className="admin-main-grid">
        <div className="admin-insight-panel">
          <div className="admin-panel-heading">
            <h2>Join Request Overview</h2>
            <Link to="/admin/join-requests">Open requests</Link>
          </div>

          <div className="admin-summary-row">
            <span>Total Join Requests</span>
            <strong>{stats.total_join_requests}</strong>
          </div>

          <div className="admin-progress-block">
            <div className="admin-progress-label">
              <span>Approved</span>
              <span>{approvedPercent}%</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill approved-fill"
                style={{ width: `${approvedPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="admin-progress-block">
            <div className="admin-progress-label">
              <span>Pending</span>
              <span>{pendingPercent}%</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill pending-fill"
                style={{ width: `${pendingPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="admin-progress-block">
            <div className="admin-progress-label">
              <span>Rejected</span>
              <span>{rejectedPercent}%</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill rejected-fill"
                style={{ width: `${rejectedPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="admin-insight-panel">
          <div className="admin-panel-heading">
            <h2>Meetup Activity</h2>
            <Link to="/admin/meetups">Manage meetups</Link>
          </div>

          <div className="admin-summary-row">
            <span>Total Meetups</span>
            <strong>{stats.total_meetups}</strong>
          </div>

          <div className="admin-summary-row">
            <span>Total Registrations</span>
            <strong>{stats.total_registrations}</strong>
          </div>

          <div className="admin-summary-row">
            <span>Total Check-ins</span>
            <strong>{stats.total_checkins}</strong>
          </div>

          <div className="admin-progress-block">
            <div className="admin-progress-label">
              <span>Check-in Rate</span>
              <span>{checkInPercent}%</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill checkin-fill"
                style={{ width: `${checkInPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="admin-insight-panel admin-wide-panel">
          <div className="admin-panel-heading">
            <h2>Recommended Admin Workflow</h2>
          </div>

          <div className="admin-workflow-list">
            <div>
              <span>1</span>
              <p>Create a community with clear rules and category.</p>
            </div>

            <div>
              <span>2</span>
              <p>Review join requests using AI score and spam risk.</p>
            </div>

            <div>
              <span>3</span>
              <p>Create meetups for approved members and track registrations.</p>
            </div>

            <div>
              <span>4</span>
              <p>Use AI meetup summary to understand interests and next topics.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;