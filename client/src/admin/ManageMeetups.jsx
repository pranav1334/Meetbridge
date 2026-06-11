import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function ManageMeetups() {
  const [meetups, setMeetups] = useState([]);
  const [filteredMeetups, setFilteredMeetups] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getBackendBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    return apiUrl.replace("/api", "");
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${getBackendBaseUrl()}${url}`;
  };

  const fetchMeetups = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/meetups/");
      const data = Array.isArray(res.data) ? res.data : [];

      setMeetups(data);
      setFilteredMeetups(data);
    } catch (error) {
      console.log("Fetch meetups error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to load meetups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetups();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredMeetups(meetups);
      return;
    }

    const filtered = meetups.filter((meetup) => {
      return (
        meetup.title?.toLowerCase().includes(keyword) ||
        meetup.community_name?.toLowerCase().includes(keyword) ||
        meetup.venue_name?.toLowerCase().includes(keyword) ||
        meetup.date?.toLowerCase().includes(keyword)
      );
    });

    setFilteredMeetups(filtered);
  }, [search, meetups]);

  const deleteMeetup = async (meetup) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${meetup.title}"?\n\nThis will delete:\n- Meetup\n- Meetup registrations\n- Attendance records\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await API.delete(`/meetups/${meetup.id}`);

      setMessage(`"${meetup.title}" deleted successfully`);

      const updated = meetups.filter((item) => item.id !== meetup.id);
      setMeetups(updated);
      setFilteredMeetups(updated);
    } catch (error) {
      console.log("Delete meetup error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to delete meetup");
    }
  };

  const formatDateTime = (meetup) => {
    const date = meetup.date || "Date not added";
    const start = meetup.start_time || "";
    const end = meetup.end_time || "";

    if (start && end) return `${date} • ${start} - ${end}`;
    if (start) return `${date} • ${start}`;
    return date;
  };

  const getRegisteredCount = (meetup) => {
    return (
      meetup.registered_count ??
      meetup.total_registrations ??
      meetup.registration_count ??
      0
    );
  };

  const getCheckedInCount = (meetup) => {
    return (
      meetup.checked_in_count ??
      meetup.total_checkins ??
      meetup.checkin_count ??
      0
    );
  };

  return (
    <div className="page">
      <div className="manage-header">
        <div>
          <h1 className="page-title">Manage Meetups</h1>

          <p className="page-subtitle">
            View, search, analyze, and delete old meetups from the admin panel.
          </p>
        </div>

        <Link to="/admin/create-meetup" className="primary-btn">
          Create New Meetup
        </Link>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="panel">
        <div className="admin-search-row">
          <input
            type="text"
            placeholder="Search meetups by title, community, venue, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="secondary-btn" onClick={fetchMeetups}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <h3>Loading meetups...</h3>
          <p>Please wait while we fetch meetup details.</p>
        </div>
      ) : filteredMeetups.length === 0 ? (
        <div className="panel empty-state">
          <h3>No meetups found</h3>
          <p>Create a meetup or try a different search keyword.</p>
        </div>
      ) : (
        <div className="manage-meetup-grid">
          {filteredMeetups.map((meetup) => (
            <div className="manage-meetup-card" key={meetup.id}>
              <div className="manage-meetup-image">
                {meetup.banner ? (
                  <img src={getImageUrl(meetup.banner)} alt={meetup.title} />
                ) : (
                  <div className="manage-meetup-placeholder">
                    <span>{meetup.title?.charAt(0) || "M"}</span>
                  </div>
                )}

                <div className="manage-meetup-date">
                  {formatDateTime(meetup)}
                </div>
              </div>

              <div className="manage-meetup-body">
                <h2>{meetup.title}</h2>

                <p className="manage-meetup-community">
                  {meetup.community_name || "Unknown Community"}
                </p>

                <p className="manage-meetup-description">
                  {meetup.description || "No description added."}
                </p>

                <div className="admin-meetup-stats">
                  <div>
                    <strong>{meetup.capacity_limit || 0}</strong>
                    <span>Capacity</span>
                  </div>

                  <div>
                    <strong>{getRegisteredCount(meetup)}</strong>
                    <span>Registered</span>
                  </div>

                  <div>
                    <strong>{getCheckedInCount(meetup)}</strong>
                    <span>Checked In</span>
                  </div>
                </div>

                <div className="admin-meetup-meta">
                  <span>{meetup.venue_name || "Venue not added"}</span>
                  <span>{meetup.registration_deadline || "No deadline"}</span>
                </div>

                <div className="admin-meetup-actions">
                  <Link
                    to={`/meetups/${meetup.id}`}
                    className="secondary-btn"
                  >
                    View
                  </Link>

                  <Link
                    to={`/admin/meetup-analytics/${meetup.id}`}
                    className="primary-btn"
                  >
                    Analytics
                  </Link>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteMeetup(meetup)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageMeetups;