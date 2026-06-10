import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AIFeatures() {
  const [communityId, setCommunityId] = useState("");
  const [meetupId, setMeetupId] = useState("");
  const [opportunityText, setOpportunityText] = useState("");
  const [moderationText, setModerationText] = useState("");

  const [resultTitle, setResultTitle] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runAI = async (type) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      let res;

      if (type === "profile") {
        res = await API.post("/ai/improve-profile", {});
        setResultTitle("AI Profile Builder");
      }

      if (type === "communities") {
        res = await API.get("/ai/community-recommendations");
        setResultTitle("AI Community Recommendations");
      }

      if (type === "meetups") {
        res = await API.get("/ai/meetup-recommendations");
        setResultTitle("AI Meetup Recommendations");
      }

      if (type === "member-matches") {
        if (!communityId) {
          setError("Enter community ID");
          setLoading(false);
          return;
        }

        res = await API.get(`/ai/member-matches/${communityId}`);
        setResultTitle("AI Member Matchmaking");
      }

      if (type === "people-to-meet") {
        if (!meetupId) {
          setError("Enter meetup ID");
          setLoading(false);
          return;
        }

        res = await API.get(`/ai/people-to-meet/${meetupId}`);
        setResultTitle("AI People to Meet");
      }

      if (type === "opportunity") {
        if (!opportunityText.trim()) {
          setError("Enter opportunity text");
          setLoading(false);
          return;
        }

        res = await API.post("/ai/opportunity-classifier", {
          text: opportunityText,
        });
        setResultTitle("AI Opportunity Classifier");
      }

      if (type === "summary") {
        if (!meetupId) {
          setError("Enter meetup ID");
          setLoading(false);
          return;
        }

        res = await API.get(`/ai/meetup-summary/${meetupId}`);
        setResultTitle("AI Meetup Summary");
      }

      if (type === "moderation") {
        if (!moderationText.trim()) {
          setError("Enter text for moderation");
          setLoading(false);
          return;
        }

        res = await API.post("/ai/safety-moderation", {
          text: moderationText,
        });
        setResultTitle("AI Safety Moderation");
      }

      setResult(res.data);
    } catch (error) {
      console.log("AI feature error:", error.response?.data);
      setError(error.response?.data?.detail || "AI feature failed");
    } finally {
      setLoading(false);
    }
  };

  const renderList = (items) => {
    if (!items || items.length === 0) return <p>No data available.</p>;

    return (
      <ul className="ai-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    if (resultTitle === "AI Profile Builder") {
      return (
        <div className="ai-result-grid">
          <div className="ai-result-card">
            <h3>Improved Bio</h3>
            <p>{result.improved_bio}</p>
          </div>

          <div className="ai-result-card">
            <h3>Looking For</h3>
            <p>{result.improved_looking_for}</p>
          </div>

          <div className="ai-result-card">
            <h3>Can Help With</h3>
            <p>{result.improved_can_help_with}</p>
          </div>

          <div className="ai-result-card">
            <h3>Profile Strength Score</h3>
            <div className="score-big">{result.profile_strength_score || 0}/100</div>
          </div>

          <div className="ai-result-card full-card">
            <h3>Tips to Improve</h3>
            {renderList(result.tips)}
          </div>
        </div>
      );
    }

    if (
      resultTitle === "AI Community Recommendations" ||
      resultTitle === "AI Meetup Recommendations"
    ) {
      const data = result.recommendations || [];

      return (
        <div className="ai-result-grid">
          {data.length === 0 ? (
            <div className="ai-result-card">
              <p>No recommendations found.</p>
            </div>
          ) : (
            data.map((item, index) => (
              <div className="ai-result-card" key={index}>
                <h3>{item.community_name || item.meetup_title}</h3>
                <div className="score-pill">
                  Match Score: {item.match_score || 0}/100
                </div>
                <p>{item.reason}</p>

                {item.community_id && (
                  <Link
                    to={`/communities/${item.community_id}`}
                    className="primary-btn"
                  >
                    Open Community
                  </Link>
                )}

                {item.meetup_id && (
                  <Link to={`/meetups/${item.meetup_id}`} className="primary-btn">
                    Open Meetup
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      );
    }

    if (resultTitle === "AI Member Matchmaking") {
      const data = result.matches || [];

      return (
        <div className="ai-result-grid">
          {data.length === 0 ? (
            <div className="ai-result-card">
              <p>No member matches found.</p>
            </div>
          ) : (
            data.map((item, index) => (
              <div className="ai-result-card" key={index}>
                <h3>{item.name}</h3>
                <div className="score-pill">
                  Match Score: {item.match_score || 0}/100
                </div>
                <p>{item.reason}</p>

                <div className="ai-suggestion">
                  <strong>Suggested Message:</strong>
                  <p>{item.suggested_message}</p>
                </div>

                <Link to={`/members/${item.user_id}`} className="primary-btn">
                  View Profile
                </Link>
              </div>
            ))
          )}
        </div>
      );
    }

    if (resultTitle === "AI People to Meet") {
      const data = result.people || [];

      return (
        <div className="ai-result-grid">
          {data.length === 0 ? (
            <div className="ai-result-card">
              <p>No people found for this meetup.</p>
            </div>
          ) : (
            data.map((item, index) => (
              <div className="ai-result-card" key={index}>
                <h3>{item.name}</h3>
                <div className="score-pill">
                  Match Score: {item.match_score || 0}/100
                </div>
                <p>{item.why_meet}</p>

                <div className="ai-suggestion">
                  <strong>Conversation Starter:</strong>
                  <p>{item.conversation_starter}</p>
                </div>

                <Link to={`/members/${item.user_id}`} className="primary-btn">
                  View Profile
                </Link>
              </div>
            ))
          )}
        </div>
      );
    }

    if (resultTitle === "AI Opportunity Classifier") {
      return (
        <div className="ai-result-grid">
          <div className="ai-result-card">
            <h3>Category</h3>
            <p>{result.category}</p>
          </div>

          <div className="ai-result-card">
            <h3>Quality Score</h3>
            <div className="score-big">{result.quality_score || 0}/100</div>
          </div>

          <div className="ai-result-card">
            <h3>Spam Risk</h3>
            <p>{result.spam_risk}</p>
          </div>

          <div className="ai-result-card full-card">
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </div>

          <div className="ai-result-card full-card">
            <h3>Suggested Tags</h3>
            {renderList(result.suggested_tags)}
          </div>
        </div>
      );
    }

    if (resultTitle === "AI Safety Moderation") {
      return (
        <div className="ai-result-grid">
          <div className="ai-result-card">
            <h3>Status</h3>
            <div className={result.safe ? "safe-badge" : "danger-badge"}>
              {result.safe ? "Safe" : "Unsafe"}
            </div>
          </div>

          <div className="ai-result-card">
            <h3>Risk Level</h3>
            <p>{result.risk_level}</p>
          </div>

          <div className="ai-result-card full-card">
            <h3>Reason</h3>
            <p>{result.reason}</p>
          </div>

          <div className="ai-result-card full-card">
            <h3>Suggested Clean Text</h3>
            <p>{result.suggested_clean_text}</p>
          </div>
        </div>
      );
    }

    if (resultTitle === "AI Meetup Summary") {
      return (
        <div className="ai-result-grid">
          <div className="ai-result-card full-card">
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </div>

          <div className="ai-result-card">
            <h3>Registration Insight</h3>
            <p>{result.total_registrations_insight}</p>
          </div>

          <div className="ai-result-card">
            <h3>Attendance Insight</h3>
            <p>{result.attendance_insight}</p>
          </div>

          <div className="ai-result-card full-card">
            <h3>Top Interests</h3>
            {renderList(result.top_interests)}
          </div>

          <div className="ai-result-card full-card">
            <h3>Next Topic Ideas</h3>
            {renderList(result.next_topic_ideas)}
          </div>

          <div className="ai-result-card full-card">
            <h3>Improvement Suggestions</h3>
            {renderList(result.improvement_suggestions)}
          </div>
        </div>
      );
    }

    return (
      <pre className="ai-json-box">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div className="page">
      <h1 className="page-title">AI Features</h1>
      <p className="page-subtitle">
        Use MeetBridge AI tools for profiles, communities, meetups, members,
        safety, and opportunities.
      </p>

      {error && <div className="error">{error}</div>}
      {loading && <div className="success">AI is generating result...</div>}

      <div className="grid">
        <div className="card">
          <h3>AI Profile Builder</h3>
          <p>Improve your bio, looking-for section, and contribution text.</p>
          <button className="primary-btn" onClick={() => runAI("profile")}>
            Improve Profile
          </button>
        </div>

        <div className="card">
          <h3>AI Community Recommendations</h3>
          <p>Find communities that match your skills and goals.</p>
          <button className="primary-btn" onClick={() => runAI("communities")}>
            Recommend Communities
          </button>
        </div>

        <div className="card">
          <h3>AI Meetup Recommendations</h3>
          <p>Find meetups useful for your networking goals.</p>
          <button className="primary-btn" onClick={() => runAI("meetups")}>
            Recommend Meetups
          </button>
        </div>

        <div className="card">
          <h3>AI Member Matchmaking</h3>
          <p>Find best members to connect with in a community.</p>

          <input
            placeholder="Enter community ID"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={() => runAI("member-matches")}
          >
            Find Member Matches
          </button>
        </div>

        <div className="card">
          <h3>AI People to Meet</h3>
          <p>Find people to meet at a specific meetup.</p>

          <input
            placeholder="Enter meetup ID"
            value={meetupId}
            onChange={(e) => setMeetupId(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={() => runAI("people-to-meet")}
          >
            Find People
          </button>
        </div>

        <div className="card">
          <h3>AI Opportunity Classifier</h3>
          <p>
            Classify jobs, internships, collaborations, and startup
            opportunities.
          </p>

          <textarea
            placeholder="Paste opportunity text..."
            value={opportunityText}
            onChange={(e) => setOpportunityText(e.target.value)}
          />

          <button className="primary-btn" onClick={() => runAI("opportunity")}>
            Classify Opportunity
          </button>
        </div>

        <div className="card">
          <h3>AI Meetup Summary</h3>
          <p>
            Admin can summarize meetup registrations, attendance, and next
            ideas.
          </p>

          <input
            placeholder="Enter meetup ID"
            value={meetupId}
            onChange={(e) => setMeetupId(e.target.value)}
          />

          <button className="primary-btn" onClick={() => runAI("summary")}>
            Generate Summary
          </button>
        </div>

        <div className="card">
          <h3>AI Safety Moderation</h3>
          <p>Check whether chat/post text is safe for the community.</p>

          <textarea
            placeholder="Enter text to check..."
            value={moderationText}
            onChange={(e) => setModerationText(e.target.value)}
          />

          <button className="primary-btn" onClick={() => runAI("moderation")}>
            Check Safety
          </button>
        </div>
      </div>

      {result && (
        <div className="panel" style={{ marginTop: "26px" }}>
          <h2>{resultTitle}</h2>
          {renderResult()}
        </div>
      )}

      <div className="admin-actions" style={{ marginTop: "24px" }}>
        <Link to="/ai-assistant" className="secondary-btn">
          Open AI Chat Assistant
        </Link>
      </div>
    </div>
  );
}

export default AIFeatures;