import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function ManageCommunities() {
  const [communities, setCommunities] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCommunities = useCallback(async () => {
    try {
      const res = await API.get("/communities/");
      setCommunities(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load communities");
    }
  }, []);

  useEffect(() => {
    const loadCommunities = async () => {
      await fetchCommunities();
    };

    loadCommunities();
  }, [fetchCommunities]);

  const deleteCommunity = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this community? This will also remove related meetups and join requests."
    );

    if (!confirmDelete) return;

    try {
      setMessage("");
      setError("");

      const res = await API.delete(`/communities/${id}`);

      setMessage(res.data.message || "Community deleted successfully");
      fetchCommunities();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to delete community");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Manage Communities</h1>
      <p className="page-subtitle">
        Admin can edit, delete, view members, and check community stats.
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="admin-actions">
        <Link to="/admin/create-community" className="primary-btn">
          Create New Community
        </Link>
      </div>

      {communities.length === 0 ? (
        <div className="panel">
          <h3>No communities found</h3>
          <p>Create a community first.</p>
        </div>
      ) : (
        <div className="grid">
          {communities.map((community) => (
            <div className="card" key={community.id}>
              <div className="card-image">
                {community.logo ? (
                  <img src={community.logo} alt={community.name} />
                ) : (
                  <span>{community.name?.charAt(0)}</span>
                )}
              </div>

              <h3>{community.name}</h3>
              <p>{community.description}</p>

              <div className="tags">
                <span>ID: {community.id}</span>
                <span>{community.category}</span>
                <span>{community.city}</span>
                <span>{community.member_count || 0} Members</span>
                <span>{community.upcoming_meetup_count || 0} Meetups</span>
              </div>

              <div className="admin-actions">
                <Link
                  to={`/communities/${community.id}`}
                  className="secondary-btn"
                >
                  View
                </Link>

                <Link
                  to={`/admin/edit-community/${community.id}`}
                  className="primary-btn"
                >
                  Edit
                </Link>

                <Link
                  to={`/members?community=${community.id}`}
                  className="secondary-btn"
                >
                  Members
                </Link>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => deleteCommunity(community.id)}
                >
                  Delete
                </button>
              </div>

              <div className="ai-box">
                <h4>Community Stats</h4>
                <p>Members: {community.member_count || 0}</p>
                <p>Meetups: {community.upcoming_meetup_count || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageCommunities;