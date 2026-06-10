import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("meetbridge_token");
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");
  const isAdmin = user?.role === "admin";

  const [community, setCommunity] = useState(null);

  const [form, setForm] = useState({
    reason: "",
    contribution: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCommunity = async () => {
    try {
      setError("");
      const res = await API.get(`/communities/${id}`);
      setCommunity(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Community not found");
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const sendJoinRequest = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await API.post("/join-requests/", {
        community_id: Number(id),
        reason: form.reason,
        contribution: form.contribution,
      });

      setMessage(res.data.message || "Join request sent successfully");

      setForm({
        reason: "",
        contribution: "",
      });
    } catch (error) {
      console.log("Join request error:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else {
        setError(detail || "Failed to send join request");
      }
    }
  };

  if (!community) {
    return (
      <div className="page">
        <h1 className="page-title">Loading community...</h1>
        {error && <div className="error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        {community.cover_image && (
          <img
            src={community.cover_image}
            alt={community.name}
            className="detail-cover-image"
          />
        )}

        <div className="community-detail-header">
          <div className="card-image">
            {community.logo ? (
              <img src={community.logo} alt={community.name} />
            ) : (
              <span>{community.name?.charAt(0)}</span>
            )}
          </div>

          <div>
            <h1 className="page-title">{community.name}</h1>
            <p className="page-subtitle">{community.description}</p>

            <div className="tags">
              {community.category && <span>{community.category}</span>}
              {community.city && <span>{community.city}</span>}
              <span>{community.member_count || 0} Members</span>
              <span>{community.upcoming_meetup_count || 0} Meetups</span>
              <span>{community.approval_type || "admin"} approval</span>
            </div>
          </div>
        </div>

        {community.rules && (
          <div className="ai-box" style={{ marginTop: "20px" }}>
            <h3>Community Rules</h3>
            <p>{community.rules}</p>
          </div>
        )}

        <div className="admin-actions" style={{ marginTop: "22px" }}>
          {token && (
            <Link
              to={`/community-chat/${community.id}`}
              className="primary-btn"
            >
              Open Community Chat
            </Link>
          )}

          {token && (
            <Link
              to={`/members?community=${community.id}`}
              className="secondary-btn"
            >
              View Members
            </Link>
          )}

          {isAdmin && (
            <Link
              to={`/admin/edit-community/${community.id}`}
              className="secondary-btn"
            >
              Edit Community
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin/join-requests" className="secondary-btn">
              View Join Requests
            </Link>
          )}

          {community.website && (
            <a
              href={community.website}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              Website
            </a>
          )}

          {community.whatsapp_link && (
            <a
              href={community.whatsapp_link}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              WhatsApp
            </a>
          )}

          {community.discord_link && (
            <a
              href={community.discord_link}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              Discord
            </a>
          )}

          {community.instagram_link && (
            <a
              href={community.instagram_link}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              Instagram
            </a>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h2>Join This Community</h2>
          <p>
            Send a join request. Admin will review your reason and contribution.
          </p>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={sendJoinRequest}>
            <div className="form-group">
              <label>Why do you want to join?</label>
              <textarea
                name="reason"
                placeholder="Explain why you want to join this community"
                value={form.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>What can you contribute?</label>
              <textarea
                name="contribution"
                placeholder="Explain what you can contribute"
                value={form.contribution}
                onChange={handleChange}
                required
              />
            </div>

            <button className="primary-btn" type="submit">
              Send Join Request
            </button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h2>Admin View</h2>
          <p>
            You are viewing this community as admin. Join request form is hidden
            for admin accounts.
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <h2>{community.member_count || 0}</h2>
              <p>Total Members</p>
            </div>

            <div className="stat-card">
              <h2>{community.upcoming_meetup_count || 0}</h2>
              <p>Total Meetups</p>
            </div>

            <div className="stat-card">
              <h2>{community.city || "N/A"}</h2>
              <p>City</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityDetails;