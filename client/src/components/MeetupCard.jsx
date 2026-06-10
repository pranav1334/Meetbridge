import { Link } from "react-router-dom";

function MeetupCard({ meetup }) {
  return (
    <div className="card">
      {meetup.banner && (
        <img
          src={meetup.banner}
          alt={meetup.title}
          className="card-cover-image"
        />
      )}

      <div className="meetup-date">
        <strong>{meetup.date}</strong>
        <span>
          {meetup.start_time} - {meetup.end_time}
        </span>
      </div>

      <h3>{meetup.title}</h3>
      <p>{meetup.description}</p>

      <div className="tags">
        <span>{meetup.venue_name}</span>
        <span>Capacity: {meetup.capacity_limit}</span>
        <span>{meetup.registration_count || 0} Registered</span>
        <span>{meetup.checkin_count || 0} Checked In</span>
      </div>

      <Link to={`/meetups/${meetup.id}`} className="primary-btn">
        View Meetup
      </Link>
    </div>
  );
}

export default MeetupCard;