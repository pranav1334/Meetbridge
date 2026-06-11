import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function ManageCommunities() {
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
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

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/communities/");
      const data = Array.isArray(res.data) ? res.data : [];

      setCommunities(data);
      setFilteredCommunities(data);
    } catch (error) {
      console.log("Fetch communities error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredCommunities(communities);
      return;
    }

    const filtered = communities.filter((community) => {
      return (
        community.name?.toLowerCase().includes(keyword) ||
        community.category?.toLowerCase().includes(keyword) ||
        community.city?.toLowerCase().includes(keyword)
      );
    });

    setFilteredCommunities(filtered);
  }, [search, communities]);

  const deleteCommunity = async (community) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${community.name}"?\n\nThis will delete:\n- Community\n- Join requests\n- Community chat messages\n- Meetups\n- Meetup registrations\n- Attendance records\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await API.delete(`/communities/${community.id}`);

      setMessage(`"${community.name}" deleted successfully`);

      const updated = communities.filter((item) => item.id !== community.id);
      setCommunities(updated);
      setFilteredCommunities(updated);
    } catch (error) {
      console.log("Delete community error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to delete community");
    }
  };

  return (
    <div className="page">
      <div className="manage-header">
        <div>
          <h1 className="page-title">Manage Communities</h1>
          <p className="page-subtitle">
            View, edit, and delete old communities from the admin panel.
          </p>
        </div>

        <Link to="/admin/create-community" className="primary-btn">
          Create New Community
        </Link>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="panel">
        <div className="admin-search-row">
          <input
            type="text"
            placeholder="Search communities by name, category, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="secondary-btn" onClick={fetchCommunities}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <h3>Loading communities...</h3>
          <p>Please wait while we fetch community details.</p>
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="panel empty-state">
          <h3>No communities found</h3>
          <p>Create a community or try a different search keyword.</p>
        </div>
      ) : (
        <div className="manage-community-grid">
          {filteredCommunities.map((community) => (
            <div className="manage-community-card" key={community.id}>
              <div className="manage-community-top">
                <div className="manage-community-logo">
                  {community.logo ? (
                    <img src={getImageUrl(community.logo)} alt={community.name} />
                  ) : (
                    <span>{community.name?.charAt(0) || "C"}</span>
                  )}
                </div>

                <div>
                  <h2>{community.name}</h2>

                  <div className="tags">
                    <span>{community.category || "No category"}</span>
                    <span>{community.city || "No city"}</span>
                    <span>{community.member_count || 0} Members</span>
                    <span>{community.upcoming_meetup_count || 0} Meetups</span>
                  </div>
                </div>
              </div>

              <p className="manage-community-description">
                {community.description || "No description added."}
              </p>

              <div className="admin-community-stats">
                <div>
                  <strong>{community.member_count || 0}</strong>
                  <span>Members</span>
                </div>

                <div>
                  <strong>{community.upcoming_meetup_count || 0}</strong>
                  <span>Meetups</span>
                </div>

                <div>
                  <strong>{community.approval_type || "admin"}</strong>
                  <span>Approval</span>
                </div>
              </div>

              <div className="admin-community-actions">
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

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteCommunity(community)}
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

export default ManageCommunities;