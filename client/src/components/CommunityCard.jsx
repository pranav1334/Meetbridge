import { Link } from "react-router-dom";

function CommunityCard({ community }) {
  return (
    <div className="card">
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
        <span>{community.category}</span>
        <span>{community.city}</span>
      </div>

      <Link to={`/communities/${community.id}`} className="primary-btn">
        View Community
      </Link>
    </div>
  );
}

export default CommunityCard;