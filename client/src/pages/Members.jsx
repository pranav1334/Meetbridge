import { useEffect, useState } from "react";
import API from "../services/api";
import MemberCard from "../components/MemberCard";

function Members() {
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");
  const isAdmin = user?.role === "admin";

  const [communityId, setCommunityId] = useState("");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");

  const fetchMembers = async (e) => {
    if (e) e.preventDefault();

    setMessage("");

    try {
      let res;

      if (isAdmin && !communityId) {
        res = await API.get("/members/", {
          params: { search },
        });
      } else {
        if (!communityId) {
          setMessage("Enter community ID to view approved members.");
          return;
        }

        res = await API.get(`/members/community/${communityId}`, {
          params: { search },
        });
      }

      setMembers(res.data);
    } catch (error) {
      setMembers([]);
      setMessage(error.response?.data?.detail || "Failed to load members");
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const loadMembers = async () => {
      setMessage("");

      try {
        const res = await API.get("/members/", {
          params: { search: "" },
        });

        setMembers(res.data);
      } catch (error) {
        setMembers([]);
        setMessage(error.response?.data?.detail || "Failed to load members");
      }
    };

    loadMembers();
  }, [isAdmin]);

  return (
    <div className="page">
      <h1 className="page-title">Members Directory</h1>
      <p className="page-subtitle">
        View approved community members and discover people to connect with.
      </p>

      {message && <div className="error">{message}</div>}

      <form className="panel form-grid" onSubmit={fetchMembers}>
        <div className="form-group">
          <label>Community ID</label>
          <input
            placeholder={
              isAdmin
                ? "Optional for admin, enter community ID to filter"
                : "Enter community ID"
            }
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
          />
          <p className="form-note">
            Open a community page and check its ID from the URL.
          </p>
        </div>

        <div className="form-group">
          <label>Search Members</label>
          <input
            placeholder="Search by name, profession, company, or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="primary-btn full" type="submit">
          Search Members
        </button>
      </form>

      {members.length === 0 ? (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h3>No members found</h3>
          <p>Approved members will appear here.</p>
        </div>
      ) : (
        <div className="grid">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Members;