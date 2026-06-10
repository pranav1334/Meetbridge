import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function ManageMeetups() {
  const [meetups, setMeetups] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMeetups = useCallback(async () => {
    try {
      const res = await API.get("/meetups/");
      setMeetups(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load meetups");
    }
  }, []);

  useEffect(() => {
    const loadMeetups = async () => {
      await fetchMeetups();
    };

    loadMeetups();
  }, [fetchMeetups]);

  const deleteMeetup = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meetup?"
    );

    if (!confirmDelete) return;

    try {
      const res = await API.delete(`/meetups/${id}`);
      setMessage(res.data.message || "Meetup deleted successfully");
      fetchMeetups();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to delete meetup");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Manage Meetups</h1>
      <p className="page-subtitle">
        View meetup history, analytics, reports, and delete meetups.
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="admin-actions">
        <Link to="/admin/create-meetup" className="primary-btn">
          Create Meetup
        </Link>
      </div>

      {meetups.length === 0 ? (
        <div className="panel">
          <h3>No meetups found</h3>
          <p>Create a meetup first.</p>
        </div>
      ) : (
        <div className="grid">
          {meetups.map((meetup) => (
            <div className="card" key={meetup.id}>
              {meetup.banner && (
                <img
                  src={meetup.banner}
                  alt={meetup.title}
                  className="card-cover-image"
                />
              )}

              <h3>{meetup.title}</h3>
              <p>{meetup.description}</p>

              <div className="tags">
                <span>ID: {meetup.id}</span>
                <span>Community ID: {meetup.community_id}</span>
                <span>{meetup.date}</span>
                <span>{meetup.registration_count || 0} Registered</span>
                <span>{meetup.checkin_count || 0} Checked In</span>
              </div>

              <div className="admin-actions">
                <Link to={`/meetups/${meetup.id}`} className="secondary-btn">
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
                  className="secondary-btn"
                  onClick={() => deleteMeetup(meetup.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageMeetups;