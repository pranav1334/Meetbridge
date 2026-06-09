import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="badge">AI-powered community platform</p>
          <h1>Discover Communities. Attend Meetups. Build Connections.</h1>
          <p>
            MeetBridge helps students, developers, founders, designers, and
            professionals join meaningful communities, attend meetups, and
            connect with the right people.
          </p>

          <div className="hero-actions">
            <Link to="/communities" className="primary-btn">
              Explore Communities
            </Link>
            <Link to="/meetups" className="secondary-btn">
              View Meetups
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <h3>What you can do</h3>
          <ul>
            <li>Find communities by city and category</li>
            <li>Send join requests</li>
            <li>Register for meetups</li>
            <li>Use AI for recommendations</li>
            <li>Network with approved members</li>
          </ul>
        </div>
      </section>

      <section className="features-grid">
        <div>
          <h3>Community Discovery</h3>
          <p>Browse and join communities based on your interests.</p>
        </div>

        <div>
          <h3>Meetup Management</h3>
          <p>Admins create meetups and members register easily.</p>
        </div>

        <div>
          <h3>AI Assistance</h3>
          <p>AI suggests communities, meetups, profiles, and join scores.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;