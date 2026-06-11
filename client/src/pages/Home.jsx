import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      title: "Community Discovery",
      text: "Users can explore communities based on category, city, interests, and goals.",
    },
    {
      title: "Smart Join Requests",
      text: "Users submit reasons and contributions. AI gives score, spam risk, and decision suggestion for admin.",
    },
    {
      title: "Meetup Management",
      text: "Admins can create meetups, users can register, check in, and track attendance.",
    },
    {
      title: "Member Networking",
      text: "Approved members can view profiles, message each other, and connect inside communities.",
    },
    {
      title: "AI Chatbox",
      text: "One AI chatbox handles profile building, recommendations, matchmaking, opportunities, and safety checks.",
    },
    {
      title: "Admin Analytics",
      text: "Admin can track users, communities, join requests, meetup registrations, and attendance.",
    },
  ];

  const aiFeatures = [
    "AI Profile Builder",
    "Community Recommendations",
    "Meetup Recommendations",
    "AI Join Request Review",
    "Member Matchmaking",
    "People to Meet",
    "Opportunity Classifier",
    "Safety Moderation",
    "Meetup Summary",
  ];

  const stats = [
    {
      number: "2",
      label: "User Roles",
    },
    {
      number: "9+",
      label: "AI Features",
    },
    {
      number: "100%",
      label: "Admin Controlled",
    },
    {
      number: "24/7",
      label: "Online Access",
    },
  ];

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">AI Powered Community Platform</div>

          <h1>
            Build, Join, and Grow Powerful Tech Communities with MeetBridge
          </h1>

          <p>
            MeetBridge connects students, developers, founders, and professionals
            through smart communities, meetups, member networking, messaging,
            and AI-powered recommendations.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-btn">
              Join MeetBridge
            </Link>

            <Link to="/communities" className="secondary-btn">
              Explore Communities
            </Link>
          </div>

          <div className="hero-mini-stats">
            <div>
              <strong>AI</strong>
              <span>Recommendations</span>
            </div>

            <div>
              <strong>JWT</strong>
              <span>Secure Login</span>
            </div>

            <div>
              <strong>Admin</strong>
              <span>Full Control</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="hero-dashboard-preview">
            <h3>MeetBridge AI Chatbox</h3>
            <p>Recommend communities for me</p>

            <div className="ai-preview-card">
              <strong>Hyderabad AI Builders</strong>
              <span>Match Score: 88/100</span>
              <p>
                Best community for AI projects, networking, startup ideas, and
                student collaboration.
              </p>
            </div>

            <div className="ai-preview-card">
              <strong>Startup Founders Circle</strong>
              <span>Match Score: 82/100</span>
              <p>
                Good match for MVP building, founder networking, and product
                discussions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span>About MeetBridge</span>
          <h2>One platform for communities, meetups, members, and AI support</h2>
          <p>
            MeetBridge is designed for community-driven networking. Admins manage
            communities and meetups, while users join, attend, chat, and grow
            through AI-powered guidance.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="step-number">01</div>
            <h3>Admin Creates Community</h3>
            <p>
              Admin creates communities with category, city, description, rules,
              social links, and approval type.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">02</div>
            <h3>User Sends Join Request</h3>
            <p>
              User explains why they want to join and what they can contribute.
              AI reviews the request.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">03</div>
            <h3>Admin Approves</h3>
            <p>
              Admin checks AI score, spam risk, and summary before approving or
              rejecting the request.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">04</div>
            <h3>Members Connect</h3>
            <p>
              Approved members can attend meetups, message people, use community
              chat, and get AI recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        {stats.map((item, index) => (
          <div className="stat-box" key={index}>
            <h2>{item.number}</h2>
            <p>{item.label}</p>
          </div>
        ))}
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span>Platform Features</span>
          <h2>Everything needed for a modern community platform</h2>
          <p>
            MeetBridge combines community management, meetup tracking, messaging,
            analytics, and AI features in one system.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map((item, index) => (
            <div className="landing-feature-card" key={index}>
              <div className="feature-icon">{index + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-section">
        <div className="ai-section-left">
          <span>AI Powered</span>
          <h2>One AI Chatbox for all smart features</h2>
          <p>
            Users do not need to open many pages. They can ask everything in one
            AI Chatbox. The AI connects with real project data such as users,
            communities, meetups, join requests, messages, and attendance.
          </p>

          <Link to="/ai-chatbox" className="primary-btn">
            Open AI Chatbox
          </Link>
        </div>

        <div className="ai-feature-list">
          {aiFeatures.map((item, index) => (
            <div className="ai-feature-pill" key={index}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="roles-section">
        <div className="section-heading">
          <span>User Roles</span>
          <h2>Clear role-based workflow</h2>
        </div>

        <div className="roles-grid">
          <div className="role-card admin-role-card">
            <h3>Admin Role</h3>
            <p>
              Admin manages the platform and controls communities, requests, and
              meetups.
            </p>

            <ul>
              <li>Create and edit communities</li>
              <li>Review join requests</li>
              <li>Approve or reject members</li>
              <li>Create meetups</li>
              <li>Track registrations and attendance</li>
              <li>Use AI meetup summary</li>
              <li>View admin analytics</li>
            </ul>
          </div>

          <div className="role-card user-role-card">
            <h3>User Role</h3>
            <p>
              Users explore communities, join groups, attend meetups, and build
              meaningful connections.
            </p>

            <ul>
              <li>Register or login with Google</li>
              <li>Explore communities</li>
              <li>Send join requests</li>
              <li>Register for meetups</li>
              <li>Check in to events</li>
              <li>Message members</li>
              <li>Use AI recommendations</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="security-section">
        <div>
          <span>Security Included</span>
          <h2>Built with secure authentication and protected backend routes</h2>
          <p>
            MeetBridge uses JWT authentication, bcrypt password hashing,
            role-based admin protection, rate limiting, input sanitization,
            secure CORS, trusted host protection, and file upload validation.
          </p>
        </div>

        <div className="security-list">
          <p>JWT Authentication</p>
          <p>Google OAuth Login</p>
          <p>bcrypt Password Hashing</p>
          <p>Admin Route Protection</p>
          <p>Rate Limiting</p>
          <p>Upload Validation</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to build your community?</h2>
        <p>
          Start by creating an account, joining a community, attending meetups,
          and using AI to find the right people and opportunities.
        </p>

        <div className="hero-actions center-actions">
          <Link to="/register" className="primary-btn">
            Get Started
          </Link>

          <Link to="/login" className="secondary-btn">
            Login
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <h3>MeetBridge</h3>
          <p>AI powered community and meetup management platform.</p>
        </div>

        <div>
          <Link to="/communities">Communities</Link>
          <Link to="/meetups">Meetups</Link>
          <Link to="/ai-chatbox">AI Chatbox</Link>
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;