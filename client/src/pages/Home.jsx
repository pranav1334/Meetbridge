import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      title: "Community Discovery",
      text: "Users can explore communities based on category, city, interests, and goals.",
    },
    {
      title: "Smart Join Requests",
      text: "Users submit reasons and contributions. AI gives score, spam risk, and decision suggestion for admin review.",
    },
    {
      title: "Meetup Management",
      text: "Admins can create meetups, users can register, check in, and attendance can be tracked.",
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
      title: "Dashboard & Insights",
      text: "The platform gives useful information about communities, requests, registrations, and meetup activity.",
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
      number: "9+",
      label: "AI Features",
    },
    {
      number: "2",
      label: "User Roles",
    },
    {
      number: "100%",
      label: "Community Focused",
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

          <h1>Build, Join, and Grow Meaningful Communities</h1>

          <p>
            MeetBridge helps students, developers, founders, and professionals
            discover communities, attend meetups, connect with members, and use
            AI to find better people, events, and opportunities.
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
              <strong>Meetups</strong>
              <span>Events & Check-ins</span>
            </div>

            <div>
              <strong>Network</strong>
              <span>Members & Chats</span>
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
            <h3>MeetBridge AI Assistant</h3>

            <p>Recommend communities for me</p>

            <div className="ai-preview-card">
              <strong>Hyderabad AI Builders</strong>
              <span>Match Score: 88/100</span>
              <p>
                A strong match for AI projects, student collaboration, startup
                ideas, and networking with developers.
              </p>
            </div>

            <div className="ai-preview-card">
              <strong>Startup Founders Circle</strong>
              <span>Match Score: 82/100</span>
              <p>
                Useful for MVP building, founder networking, product ideas, and
                early-stage startup discussions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span>About MeetBridge</span>

          <h2>One platform for communities, meetups, networking, and AI support</h2>

          <p>
            MeetBridge is designed for organized community building. It brings
            together community discovery, join request approval, meetup
            registration, attendance tracking, member profiles, messaging, and AI
            assistance in one simple platform.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="step-number">01</div>
            <h3>Create Communities</h3>
            <p>
              Communities can be created with category, city, description, rules,
              social links, and approval workflow.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">02</div>
            <h3>Send Join Requests</h3>
            <p>
              Users explain why they want to join and what they can contribute.
              AI reviews the request.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">03</div>
            <h3>Attend Meetups</h3>
            <p>
              Users can register for meetups, check in, and participate in real
              community events.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">04</div>
            <h3>Connect & Grow</h3>
            <p>
              Members can message, use community chat, find people to meet, and
              get AI-powered recommendations.
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
            MeetBridge combines community management, meetup tracking, member
            networking, messaging, and AI-powered support for a complete
            community experience.
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
            Users do not need to open many separate AI tools. They can ask
            everything in one AI Chatbox. The AI can work with real project data
            like users, communities, meetups, join requests, attendance, and
            messages.
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

      <section className="audience-section">
        <div className="section-heading">
          <span>Built For Community Growth</span>

          <h2>
            Designed for students, developers, founders, and professional
            communities
          </h2>

          <p>
            MeetBridge helps people discover the right communities, attend
            meaningful meetups, connect with like-minded members, and use AI to
            find better opportunities, people, and events.
          </p>
        </div>

        <div className="audience-grid">
          <div className="audience-card">
            <h3>For Students</h3>
            <p>
              Students can join learning communities, attend meetups, find
              project partners, connect with mentors, and discover internships or
              collaboration opportunities.
            </p>
          </div>

          <div className="audience-card">
            <h3>For Developers</h3>
            <p>
              Developers can explore tech communities, showcase their skills,
              meet teammates, join project discussions, and build strong
              professional networks.
            </p>
          </div>

          <div className="audience-card">
            <h3>For Founders</h3>
            <p>
              Founders can create startup-focused communities, find early team
              members, organize meetups, share ideas, and connect with people
              who can contribute to their vision.
            </p>
          </div>
        </div>
      </section>

      <section className="impact-section">
        <div className="impact-content">
          <span>Why MeetBridge?</span>

          <h2>A smarter way to manage communities and networking</h2>

          <p>
            Many communities depend on scattered WhatsApp groups, manual
            approvals, random event registrations, and unorganized member
            interactions. MeetBridge brings everything into one structured
            platform with AI assistance.
          </p>
        </div>

        <div className="impact-points">
          <div>
            <h3>Organized Communities</h3>
            <p>
              Communities are listed with proper details, rules, social links,
              and approval workflow.
            </p>
          </div>

          <div>
            <h3>Meaningful Networking</h3>
            <p>
              Members can discover people based on skills, goals, interests, and
              meetup participation.
            </p>
          </div>

          <div>
            <h3>AI Assistance</h3>
            <p>
              AI helps with profile improvement, recommendations, matchmaking,
              opportunity classification, safety checks, and meetup summaries.
            </p>
          </div>

          <div>
            <h3>Better Event Management</h3>
            <p>
              Meetups can be created, users can register, attendance can be
              tracked, and useful insights can be viewed.
            </p>
          </div>
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