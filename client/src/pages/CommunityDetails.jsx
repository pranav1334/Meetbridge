import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("meetbridge_token");
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");
  const isAdmin = user?.role === "admin";

  const [community, setCommunity] = useState(null);
  const [form, setForm] = useState({
    community_id: Number(id),
    reason: "",
    contribution: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCommunity = async () => {
    try {
      const res = await API.get(`/communities/${id}`);
      setCommunity(res.data);
    } catch (error) {
      setError("Community not found");
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
      const res = await API.post("/join-requests/", form);

      setMessage(res.data.message || "Join request sent successfully");

      setForm({
        community_id: Number(id),
        reason: "",
        contribution: "",
      });
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to send join request");
    }
  };

  if (!community) {
    return (
      <div className="page">
        <h1 className="page-title">Loading...</h1>
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
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "20px",
              marginBottom: "22px",
            }}
          />
        )}

        <h1 className="page-title">{community.name}</h1>
        <p className="page-subtitle">{community.description}</p>

        <div className="tags">
          <span>{community.category}</span>
          <span>{community.city}</span>
          <span>Approval: {community.approval_type}</span>
        </div>

        {community.rules && (
          <div className="ai-box">
            <h3>Community Rules</h3>
            <p>{community.rules}</p>
          </div>
        )}

        {community.website && (
          <a
            className="secondary-btn"
            href={community.website}
            target="_blank"
            rel="noreferrer"
          >
            Visit Website
          </a>
        )}
      </div>

      {!isAdmin && (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h2>Join this Community</h2>
          <p>
            Visitors can request to join. Admin will approve or reject your
            request.
          </p>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={sendJoinRequest}>
            <div className="form-group">
              <label>Why do you want to join this community?</label>
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
                placeholder="Explain what you can contribute to this community"
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
            You are viewing this community as an admin. Join request form is
            hidden because admins manage communities.
          </p>
        </div>
      )}
    </div>
  );
}

export default CommunityDetails;