import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");

  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  const fetchMyRequests = async () => {
    try {
      setError("");
      const res = await API.get("/join-requests/my-requests");
      setRequests(res.data);
    } catch (error) {
      console.log("My requests error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to load join requests");
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">User Dashboard</h1>
      <p className="page-subtitle">
        View your profile, join requests, meetups, and AI tools.
      </p>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <h2>My Profile</h2>

        <div className="profile-grid">
          <div className="ai-box">
            <h3>Name</h3>
            <p>{user?.full_name || "Not available"}</p>
          </div>

          <div className="ai-box">
            <h3>Email</h3>
            <p>{user?.email || "Not available"}</p>
          </div>

          <div className="ai-box">
            <h3>Role</h3>
            <p>{user?.role || "member"}</p>
          </div>

          <div className="ai-box">
            <h3>Profession</h3>
            <p>{user?.profession || "Not added"}</p>
          </div>
        </div>

        <div className="admin-actions">
          <Link to="/communities" className="primary-btn">
            Explore Communities
          </Link>

          <Link to="/meetups" className="secondary-btn">
            Explore Meetups
          </Link>

          <Link to="/ai-assistant" className="secondary-btn">
            Open AI Assistant
          </Link>
        </div>
      </div>

      <div className="panel" style={{ marginTop: "24px" }}>
        <h2>My Join Requests</h2>

        {requests.length === 0 ? (
          <p>You have not sent any join request yet.</p>
        ) : (
          <div className="grid">
            {requests.map((item) => (
              <div className="card" key={item.id}>
                <div className="tags">
                  <span>{item.status}</span>
                  <span>Score: {item.ai_score ?? "N/A"}</span>
                  <span>AI: {item.ai_decision || "N/A"}</span>
                </div>

                <h3>{item.community_name}</h3>

                <p>
                  <strong>Reason:</strong> {item.reason}
                </p>

                <p>
                  <strong>Contribution:</strong> {item.contribution}
                </p>

                {item.ai_summary && (
                  <div className="ai-box">
                    <h4>AI Review</h4>
                    <p>{item.ai_summary}</p>
                  </div>
                )}

                <Link
                  to={`/communities/${item.community_id}`}
                  className="primary-btn"
                >
                  Open Community
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;