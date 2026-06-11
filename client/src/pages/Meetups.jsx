import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Meetups() {
  const [meetups, setMeetups] = useState([]);
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

      const res = await API.get("/meetups");
      setMeetups(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Meetups fetch error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to load meetups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetups();
  }, []);

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
      <div className="meetups-header">
        <div>
          <h1 className="page-title">Meetups</h1>
          <p className="page-subtitle">
            Discover upcoming community events, register for sessions, and meet
            people with similar interests.
          </p>
        </div>

        <Link to="/ai-chatbox" className="secondary-btn">
          Ask AI for Meetup Suggestions
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="panel">
          <h3>Loading meetups...</h3>
          <p>Please wait while we fetch the latest meetups.</p>
        </div>
      ) : meetups.length === 0 ? (
        <div className="panel empty-state">
          <h3>No meetups available</h3>
          <p>
            Meetups created by admin will appear here. Check again later or ask
            admin to create a meetup.
          </p>
        </div>
      ) : (
        <div className="meetups-grid">
          {meetups.map((meetup) => (
            <div className="meetup-card-new" key={meetup.id}>
              <div className="meetup-image-wrap">
                {meetup.banner ? (
                  <img
                    src={getImageUrl(meetup.banner)}
                    alt={meetup.title}
                    className="meetup-card-image"
                  />
                ) : (
                  <div className="meetup-placeholder">
                    <span>{meetup.title?.charAt(0) || "M"}</span>
                  </div>
                )}

                <div className="meetup-date-badge">
                  {formatDateTime(meetup)}
                </div>
              </div>

              <div className="meetup-card-body">
                <h2>{meetup.title}</h2>

                <p className="meetup-description">
                  {meetup.description || "No description added for this meetup."}
                </p>

                <div className="meetup-meta-row">
                  <span>{meetup.venue_name || "Venue not added"}</span>
                  <span>Capacity: {meetup.capacity_limit || 0}</span>
                  <span>{getRegisteredCount(meetup)} Registered</span>
                  <span>{getCheckedInCount(meetup)} Checked In</span>
                </div>

                <div className="meetup-card-actions">
                  <Link to={`/meetups/${meetup.id}`} className="primary-btn">
                    View Meetup
                  </Link>

                  {meetup.google_maps_link && (
                    <a
                      href={meetup.google_maps_link}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-btn"
                    >
                      View Location
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Meetups;