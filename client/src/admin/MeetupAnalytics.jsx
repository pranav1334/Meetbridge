import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function MeetupAnalytics() {
  const { id } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await API.get(`/meetups/${id}/analytics`);
      setAnalytics(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load analytics");
    }
  }, [id]);

  useEffect(() => {
    const loadAnalytics = async () => {
      await fetchAnalytics();
    };

    loadAnalytics();
  }, [fetchAnalytics]);

  const downloadCSV = async (type) => {
    try {
      setError("");
      setMessage("");

      const endpoint =
        type === "attendees"
          ? `/meetups/${id}/export/attendees`
          : `/meetups/${id}/export/responses`;

      const res = await API.get(endpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        type === "attendees"
          ? `meetup_${id}_attendees.csv`
          : `meetup_${id}_responses.csv`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("CSV downloaded successfully");
    } catch {
      setError("CSV download failed. Please login as admin and try again.");
    }
  };

  if (error && !analytics) {
    return (
      <div className="page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="page">
        <h1 className="page-title">Loading analytics...</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Meetup Analytics</h1>
      <p className="page-subtitle">{analytics.meetup_title}</p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{analytics.total_registrations}</h2>
          <p>Total Registrations</p>
        </div>

        <div className="stat-card">
          <h2>{analytics.total_checkins}</h2>
          <p>Total Check-ins</p>
        </div>

        <div className="stat-card">
          <h2>{analytics.attendance_percentage}%</h2>
          <p>Attendance Percentage</p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: "24px" }}>
        <h2>Most Active Members</h2>

        {analytics.most_active_members.length === 0 ? (
          <p>No checked-in members yet.</p>
        ) : (
          <div className="grid">
            {analytics.most_active_members.map((member) => (
              <div className="card" key={member.id}>
                <h3>{member.full_name}</h3>

                <div className="tags">
                  {member.profession && <span>{member.profession}</span>}
                  {member.city && <span>{member.city}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: "24px" }}>
        <h2>Export Reports</h2>
        <p>
          CSV export works through secure frontend buttons because the backend
          needs admin login token.
        </p>

        <div className="admin-actions">
          <button
            className="primary-btn"
            type="button"
            onClick={() => downloadCSV("attendees")}
          >
            Export Attendee List CSV
          </button>

          <button
            className="secondary-btn"
            type="button"
            onClick={() => downloadCSV("responses")}
          >
            Export Registration Responses CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetupAnalytics;