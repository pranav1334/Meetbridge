import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function FormattedAIText({ text }) {
  if (!text) return null;

  const cleanText = text
    .replace(/\*\*/g, "")
    .replace(/###/g, "")
    .replace(/##/g, "")
    .replace(/#/g, "")
    .replace(/(\d+\.\s)/g, "\n$1")
    .replace(/\s-\s/g, "\n- ")
    .trim();

  const lines = cleanText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="formatted-ai-answer">
      {lines.map((line, index) => {
        if (/^\d+\./.test(line)) {
          return (
            <h4 key={index} className="ai-answer-heading">
              {line}
            </h4>
          );
        }

        if (line.startsWith("-")) {
          return (
            <div key={index} className="ai-answer-bullet">
              <span>•</span>
              <p>{line.replace("-", "").trim()}</p>
            </div>
          );
        }

        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

function AIChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      type: "text",
      text:
        "Hi, I am your MeetBridge AI Assistant. I can help you choose the right communities, improve your profile, discover useful meetups, find members to connect with, check opportunities, and keep conversations safer. Type your question below or choose any tool from the left side.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const getNumberFromText = (text) => {
    const match = text.match(/\d+/);
    return match ? match[0] : null;
  };

  const getTextAfterColon = (text) => {
    const parts = text.split(":");
    if (parts.length > 1) {
      return parts.slice(1).join(":").trim();
    }
    return text;
  };

  const detectFeatureAndCallAPI = async (userText) => {
    const lower = userText.toLowerCase();

    if (
      lower.includes("improve profile") ||
      lower.includes("profile builder") ||
      lower.includes("make my profile better") ||
      lower.includes("profile improve")
    ) {
      const res = await API.post("/ai/improve-profile", {});
      return {
        title: "AI Profile Builder",
        data: res.data,
      };
    }

    if (
      lower.includes("recommend communities") ||
      lower.includes("community recommendation") ||
      lower.includes("suggest communities") ||
      lower.includes("best communities")
    ) {
      const res = await API.get("/ai/community-recommendations");
      return {
        title: "AI Community Recommendations",
        data: res.data,
      };
    }

    if (
      lower.includes("recommend meetups") ||
      lower.includes("meetup recommendation") ||
      lower.includes("suggest meetups") ||
      lower.includes("best meetups")
    ) {
      const res = await API.get("/ai/meetup-recommendations");
      return {
        title: "AI Meetup Recommendations",
        data: res.data,
      };
    }

    if (
      lower.includes("member match") ||
      lower.includes("member matches") ||
      lower.includes("matchmaking") ||
      lower.includes("find members")
    ) {
      const communityId = getNumberFromText(userText);

      if (!communityId) {
        return {
          title: "Community ID Required",
          data: {
            message:
              "Please enter a community ID. Example: Find member matches for community 1.",
          },
        };
      }

      const res = await API.get(`/ai/member-matches/${communityId}`);
      return {
        title: "AI Member Matchmaking",
        data: res.data,
      };
    }

    if (
      lower.includes("people to meet") ||
      lower.includes("find people") ||
      lower.includes("meet people") ||
      lower.includes("networking people")
    ) {
      const meetupId = getNumberFromText(userText);

      if (!meetupId) {
        return {
          title: "Meetup ID Required",
          data: {
            message:
              "Please enter a meetup ID. Example: Find people to meet in meetup 1.",
          },
        };
      }

      const res = await API.get(`/ai/people-to-meet/${meetupId}`);
      return {
        title: "AI People to Meet",
        data: res.data,
      };
    }

    if (
      lower.includes("classify opportunity") ||
      lower.includes("opportunity classifier") ||
      lower.includes("classify this opportunity") ||
      lower.includes("job classifier")
    ) {
      const text = getTextAfterColon(userText);

      if (!text || text.length < 5) {
        return {
          title: "Opportunity Text Required",
          data: {
            message:
              "Please type opportunity text. Example: Classify opportunity: React internship for students with frontend skills.",
          },
        };
      }

      const res = await API.post("/ai/opportunity-classifier", {
        text,
      });

      return {
        title: "AI Opportunity Classifier",
        data: res.data,
      };
    }

    if (
      lower.includes("check safety") ||
      lower.includes("safety moderation") ||
      lower.includes("moderate") ||
      lower.includes("is this safe")
    ) {
      const text = getTextAfterColon(userText);

      if (!text || text.length < 3) {
        return {
          title: "Safety Text Required",
          data: {
            message:
              "Please enter text to check. Example: Check safety: I am looking for a React teammate.",
          },
        };
      }

      const res = await API.post("/ai/safety-moderation", {
        text,
      });

      return {
        title: "AI Safety Moderation",
        data: res.data,
      };
    }

    if (
      lower.includes("summarize meetup") ||
      lower.includes("meetup summary") ||
      lower.includes("summary meetup")
    ) {
      const meetupId = getNumberFromText(userText);

      if (!meetupId) {
        return {
          title: "Meetup ID Required",
          data: {
            message: "Please enter a meetup ID. Example: Summarize meetup 1.",
          },
        };
      }

      const res = await API.get(`/ai/meetup-summary/${meetupId}`);

      return {
        title: "AI Meetup Summary",
        data: res.data,
      };
    }

    const res = await API.post("/ai/chat", {
      message: userText,
    });

    return {
      title: "AI Assistant",
      data: {
        answer: res.data.answer,
      },
    };
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userText = input.trim();

    addMessage({
      sender: "user",
      type: "text",
      text: userText,
    });

    setInput("");
    setLoading(true);

    try {
      const result = await detectFeatureAndCallAPI(userText);

      addMessage({
        sender: "ai",
        type: "result",
        title: result.title,
        data: result.data,
      });
    } catch (error) {
      console.log("AI Assistant error:", error.response?.data);

      addMessage({
        sender: "ai",
        type: "text",
        text:
          error.response?.data?.detail ||
          "AI request failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderList = (items) => {
    if (!items || items.length === 0) {
      return <p>No data available.</p>;
    }

    return (
      <ul className="ai-chat-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderAIResult = (message) => {
    const title = message.title;
    const data = message.data;

    if (data.message) {
      return <p>{data.message}</p>;
    }

    if (data.answer) {
      return <FormattedAIText text={data.answer} />;
    }

    if (title === "AI Profile Builder") {
      return (
        <div className="ai-chat-result-grid">
          <div className="ai-chat-result-card">
            <h4>Improved Bio</h4>
            <p>{data.improved_bio}</p>
          </div>

          <div className="ai-chat-result-card">
            <h4>Improved Looking For</h4>
            <p>{data.improved_looking_for}</p>
          </div>

          <div className="ai-chat-result-card">
            <h4>Improved Can Help With</h4>
            <p>{data.improved_can_help_with}</p>
          </div>

          <div className="ai-chat-result-card">
            <h4>Profile Strength</h4>
            <div className="ai-chat-score">
              {data.profile_strength_score || 0}/100
            </div>
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Tips to Improve</h4>
            {renderList(data.tips)}
          </div>
        </div>
      );
    }

    if (
      title === "AI Community Recommendations" ||
      title === "AI Meetup Recommendations"
    ) {
      const recommendations = data.recommendations || [];

      if (recommendations.length === 0) {
        return <p>No recommendations found.</p>;
      }

      return (
        <div className="ai-chat-result-grid">
          {recommendations.map((item, index) => (
            <div className="ai-chat-result-card" key={index}>
              <h4>{item.community_name || item.meetup_title}</h4>

              <div className="ai-chat-pill">
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
          ))}
        </div>
      );
    }

    if (title === "AI Member Matchmaking") {
      const matches = data.matches || [];

      if (matches.length === 0) {
        return <p>No member matches found.</p>;
      }

      return (
        <div className="ai-chat-result-grid">
          {matches.map((item, index) => (
            <div className="ai-chat-result-card" key={index}>
              <h4>{item.name}</h4>

              <div className="ai-chat-pill">
                Match Score: {item.match_score || 0}/100
              </div>

              <p>{item.reason}</p>

              <div className="ai-chat-suggestion">
                <strong>Suggested Message:</strong>
                <p>{item.suggested_message}</p>
              </div>

              <Link to={`/members/${item.user_id}`} className="primary-btn">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      );
    }

    if (title === "AI People to Meet") {
      const people = data.people || [];

      if (people.length === 0) {
        return <p>No people found for this meetup.</p>;
      }

      return (
        <div className="ai-chat-result-grid">
          {people.map((item, index) => (
            <div className="ai-chat-result-card" key={index}>
              <h4>{item.name}</h4>

              <div className="ai-chat-pill">
                Match Score: {item.match_score || 0}/100
              </div>

              <p>{item.why_meet}</p>

              <div className="ai-chat-suggestion">
                <strong>Conversation Starter:</strong>
                <p>{item.conversation_starter}</p>
              </div>

              <Link to={`/members/${item.user_id}`} className="primary-btn">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      );
    }

    if (title === "AI Opportunity Classifier") {
      return (
        <div className="ai-chat-result-grid">
          <div className="ai-chat-result-card">
            <h4>Category</h4>
            <p>{data.category}</p>
          </div>

          <div className="ai-chat-result-card">
            <h4>Quality Score</h4>
            <div className="ai-chat-score">{data.quality_score || 0}/100</div>
          </div>

          <div className="ai-chat-result-card">
            <h4>Spam Risk</h4>
            <p>{data.spam_risk}</p>
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Summary</h4>
            <p>{data.summary}</p>
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Suggested Tags</h4>
            {renderList(data.suggested_tags)}
          </div>
        </div>
      );
    }

    if (title === "AI Safety Moderation") {
      return (
        <div className="ai-chat-result-grid">
          <div className="ai-chat-result-card">
            <h4>Status</h4>
            <div className={data.safe ? "safe-badge" : "danger-badge"}>
              {data.safe ? "Safe" : "Unsafe"}
            </div>
          </div>

          <div className="ai-chat-result-card">
            <h4>Risk Level</h4>
            <p>{data.risk_level}</p>
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Reason</h4>
            <p>{data.reason}</p>
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Suggested Clean Text</h4>
            <p>{data.suggested_clean_text}</p>
          </div>
        </div>
      );
    }

    if (title === "AI Meetup Summary") {
      return (
        <div className="ai-chat-result-grid">
          <div className="ai-chat-result-card full-card">
            <h4>Summary</h4>
            <p>{data.summary}</p>
          </div>

          <div className="ai-chat-result-card">
            <h4>Registration Insight</h4>
            <p>{data.total_registrations_insight}</p>
          </div>

          <div className="ai-chat-result-card">
            <h4>Attendance Insight</h4>
            <p>{data.attendance_insight}</p>
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Top Interests</h4>
            {renderList(data.top_interests)}
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Next Topic Ideas</h4>
            {renderList(data.next_topic_ideas)}
          </div>

          <div className="ai-chat-result-card full-card">
            <h4>Improvement Suggestions</h4>
            {renderList(data.improvement_suggestions)}
          </div>
        </div>
      );
    }

    return (
      <pre className="ai-json-box">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="page">
      <h1 className="page-title">MeetBridge AI Assistant</h1>

      <p className="page-subtitle">
        Your smart assistant for community discovery, meetup planning, member
        networking, opportunity checking, profile improvement, and safety
        support.
      </p>

      <div className="ai-assistant-info">
        <div className="ai-info-card">
          <h3>Smart Guidance</h3>
          <p>
            Get help choosing communities, improving your profile, finding
            meetups, and understanding opportunities.
          </p>
        </div>

        <div className="ai-info-card">
          <h3>Connected to MeetBridge</h3>
          <p>
            The assistant works with platform data like communities, meetups,
            members, join requests, attendance, and messages.
          </p>
        </div>

        <div className="ai-info-card">
          <h3>Simple Commands</h3>
          <p>
            Use natural commands like “Recommend communities”, “Improve my
            profile”, or “Find people to meet in meetup 1”.
          </p>
        </div>
      </div>

      <div className="ai-chat-layout">
        <div className="ai-chat-help">
          <h3>AI Tools</h3>

          <p className="ai-help-text">
            Choose a tool or type your own question. You can edit the text before
            sending.
          </p>

          <button onClick={() => setInput("Improve my profile")}>
            Improve my profile
          </button>

          <button onClick={() => setInput("Recommend communities for me")}>
            Recommend communities
          </button>

          <button onClick={() => setInput("Recommend meetups for me")}>
            Recommend meetups
          </button>

          <button onClick={() => setInput("Find member matches for community 1")}>
            Member matches
          </button>

          <button onClick={() => setInput("Find people to meet in meetup 1")}>
            People to meet
          </button>

          <button
            onClick={() =>
              setInput(
                "Classify opportunity: React internship for students with HTML, CSS, JavaScript, and React skills"
              )
            }
          >
            Classify opportunity
          </button>

          <button
            onClick={() =>
              setInput(
                "Check safety: I am looking for a React teammate for my AI project"
              )
            }
          >
            Safety check
          </button>

          <button onClick={() => setInput("Summarize meetup 1")}>
            Meetup summary
          </button>
        </div>

        <div className="ai-chatbox">
          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "user"
                    ? "ai-message user-message"
                    : "ai-message bot-message"
                }
              >
                {message.type === "text" && <FormattedAIText text={message.text} />}

                {message.type === "result" && (
                  <>
                    <h3>{message.title}</h3>
                    {renderAIResult(message)}
                  </>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-message bot-message">
                <p>AI Assistant is thinking...</p>
              </div>
            )}
          </div>

          <form className="ai-chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Ask MeetBridge AI Assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button type="submit" className="primary-btn" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AIChatBox;