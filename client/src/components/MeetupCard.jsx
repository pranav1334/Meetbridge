import { Link } from "react-router-dom";

function MeetupCard({ meetup }) {
  return (
    <div className="card">
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
      </div>

      <Link to={`/meetups/${meetup.id}`} className="primary-btn">
        View Meetup
      </Link>
    </div>
  );
}

export default MeetupCard;  