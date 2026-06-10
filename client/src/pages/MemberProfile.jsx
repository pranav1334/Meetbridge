import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

function MemberProfile() {
  const { id } = useParams();

  const [member, setMember] = useState(null);
  const [error, setError] = useState("");

  const fetchMember = useCallback(async () => {
    try {
      setError("");
      const res = await API.get(`/members/${id}`);
      setMember(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load member profile");
    }
  }, [id]);

  useEffect(() => {
    const loadMember = async () => {
      await fetchMember();
    };

    loadMember();
  }, [fetchMember]);

  if (error) {
    return (
      <div className="page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="page">
        <h1 className="page-title">Loading profile...</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        <div className="profile-header">
          <div className="profile-avatar">
            {member.profile_picture ? (
              <img src={member.profile_picture} alt={member.full_name} />
            ) : (
              <span>{member.full_name?.charAt(0)}</span>
            )}
          </div>

          <div>
            <h1 className="page-title">{member.full_name}</h1>
            <p className="page-subtitle">{member.bio || "No bio added yet."}</p>

            <div className="tags">
              <span>{member.role}</span>
              {member.profession && <span>{member.profession}</span>}
              {member.city && <span>{member.city}</span>}
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="ai-box">
            <h3>Email</h3>
            <p>{member.email || "Not added"}</p>
          </div>

          <div className="ai-box">
            <h3>Company / College</h3>
            <p>{member.company_college || "Not added"}</p>
          </div>

          <div className="ai-box">
            <h3>Looking For</h3>
            <p>{member.looking_for || "Not added"}</p>
          </div>

          <div className="ai-box">
            <h3>Can Help With</h3>
            <p>{member.can_help_with || "Not added"}</p>
          </div>

          <div className="ai-box">
            <h3>Activity</h3>
            <p>Communities Joined: {member.joined_communities}</p>
            <p>Meetups Attended: {member.meetups_attended}</p>
          </div>
        </div>

        <div className="admin-actions">
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              LinkedIn
            </a>
          )}

          {member.instagram_url && (
            <a
              href={member.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              Instagram
            </a>
          )}

          {member.website_url && (
            <a
              href={member.website_url}
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              Website
            </a>
          )}

          <Link to={`/messages?user=${member.id}`} className="primary-btn">
            Message Member
          </Link>

          <Link to="/members" className="secondary-btn">
            Back to Members
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MemberProfile;