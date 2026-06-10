import { Link } from "react-router-dom";

function MemberCard({ member }) {
  return (
    <div className="card">
      <div className="card-image">
        {member.profile_picture ? (
          <img src={member.profile_picture} alt={member.full_name} />
        ) : (
          <span>{member.full_name?.charAt(0)}</span>
        )}
      </div>

      <h3>{member.full_name}</h3>

      <p>{member.bio || "No bio added yet."}</p>

      <div className="tags">
        {member.role && <span>{member.role}</span>}
        {member.profession && <span>{member.profession}</span>}
        {member.city && <span>{member.city}</span>}
      </div>

      {member.company_college && (
        <p>
          <strong>Company / College:</strong> {member.company_college}
        </p>
      )}

      {member.looking_for && (
        <p>
          <strong>Looking For:</strong> {member.looking_for}
        </p>
      )}

      {member.can_help_with && (
        <p>
          <strong>Can Help With:</strong> {member.can_help_with}
        </p>
      )}

      <Link to={`/members/${member.id}`} className="primary-btn">
        View Profile
      </Link>
    </div>
  );
}

export default MemberCard;