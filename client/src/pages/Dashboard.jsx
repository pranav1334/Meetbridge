import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);

  const fetchData = async () => {
    try {
      const userRes = await API.get("/auth/me");
      setUser(userRes.data);

      const reqRes = await API.get("/join-requests/my");
      setRequests(reqRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <div className="page">
      <h1 className="page-title">
        {isAdmin ? "Admin Dashboard" : "User Dashboard"}
      </h1>

      <p className="page-subtitle">
        {isAdmin
          ? "Manage communities, meetups, join requests, and AI tools."
          : "View your profile, join requests, meetups, and AI tools."}
      </p>

      {user && (
        <div className="panel">
          <h2>{user.full_name}</h2>
          <p>{user.email}</p>

          <div className="tags">
            <span>{user.role}</span>
            {user.profession && <span>{user.profession}</span>}
            {user.city && <span>{user.city}</span>}
          </div>

          <p>{user.bio}</p>

          <div className="admin-actions">
            {isAdmin ? (
              <>
                <Link to="/admin" className="primary-btn">
                  Open Admin Panel
                </Link>

                <Link to="/admin/create-community" className="secondary-btn">
                  Create Community
                </Link>

                <Link to="/admin/create-meetup" className="secondary-btn">
                  Create Meetup
                </Link>

                <Link to="/admin/join-requests" className="secondary-btn">
                  Join Requests
                </Link>
              </>
            ) : (
              <>
                <Link to="/communities" className="primary-btn">
                  Explore Communities
                </Link>

                <Link to="/meetups" className="secondary-btn">
                  Explore Meetups
                </Link>

                <Link to="/ai-assistant" className="secondary-btn">
                  Open AI Assistant
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h2>My Join Requests</h2>

          {requests.length === 0 ? (
            <p>You have not sent any join request yet.</p>
          ) : (
            <div className="grid">
              {requests.map((req) => (
                <div className="card" key={req.id}>
                  <h3>Community ID: {req.community_id}</h3>

                  <p>
                    <strong>Status:</strong> {req.status}
                  </p>

                  <p>
                    <strong>Reason:</strong> {req.reason}
                  </p>

                  <p>
                    <strong>Contribution:</strong> {req.contribution}
                  </p>

                  {req.ai_score !== null && req.ai_score !== undefined && (
                    <div className="ai-box">
                      <h4>AI Review</h4>
                      <p>Score: {req.ai_score}/100</p>
                      <p>Decision: {req.ai_decision}</p>
                      <p>Spam Risk: {req.ai_spam_risk}</p>
                      <p>{req.ai_reason_summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;