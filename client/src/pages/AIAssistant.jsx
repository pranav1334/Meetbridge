import { useState } from "react";
import API from "../services/api";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [replyType, setReplyType] = useState("text");
  const [loading, setLoading] = useState(false);

  const askAI = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setLoading(true);
      setReply("");
      setReplyType("text");

      const res = await API.post("/ai/chat", {
        message,
      });

      setReply(res.data.reply);
      setMessage("");
    } catch (error) {
      setReply(error.response?.data?.detail || "AI assistant failed");
      setReplyType("text");
    } finally {
      setLoading(false);
    }
  };

  const getCommunityRecommendations = async () => {
    try {
      setLoading(true);
      setReply("");
      setReplyType("community");

      const res = await API.get("/ai/community-recommendations");
      setReply(res.data);
    } catch (error) {
      setReply(error.response?.data?.detail || "Recommendation failed");
      setReplyType("text");
    } finally {
      setLoading(false);
    }
  };

  const getMeetupRecommendations = async () => {
    try {
      setLoading(true);
      setReply("");
      setReplyType("meetup");

      const res = await API.get("/ai/meetup-recommendations");
      setReply(res.data);
    } catch (error) {
      setReply(error.response?.data?.detail || "Recommendation failed");
      setReplyType("text");
    } finally {
      setLoading(false);
    }
  };

  const renderAIResponse = () => {
    if (!reply) return null;

    if (replyType === "community" && Array.isArray(reply)) {
      return (
        <div className="ai-box">
          <h3>Recommended Communities</h3>

          {reply.map((item, index) => (
            <div className="ai-result-card" key={index}>
              <h4>{item.community_name}</h4>

              <div className="tags">
                <span>Score: {item.score}/100</span>
                <span>Community ID: {item.community_id}</span>
              </div>

              <p>{item.reason}</p>
            </div>
          ))}
        </div>
      );
    }

    if (replyType === "meetup" && Array.isArray(reply)) {
      return (
        <div className="ai-box">
          <h3>Recommended Meetups</h3>

          {reply.map((item, index) => (
            <div className="ai-result-card" key={index}>
              <h4>{item.meetup_title}</h4>

              <div className="tags">
                <span>Score: {item.score}/100</span>
                <span>Meetup ID: {item.meetup_id}</span>
              </div>

              <p>{item.reason}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="ai-box">
        <h3>AI Response</h3>
        <p>{typeof reply === "string" ? reply : JSON.stringify(reply)}</p>
      </div>
    );
  };

  return (
    <div className="page">
      <h1 className="page-title">AI Assistant</h1>
      <p className="page-subtitle">
        Ask AI to suggest communities, meetups, profile improvements, and
        networking ideas.
      </p>

      <div className="panel">
        <div className="admin-actions">
          <button
            className="secondary-btn"
            type="button"
            onClick={getCommunityRecommendations}
          >
            Recommend Communities
          </button>

          <button
            className="secondary-btn"
            type="button"
            onClick={getMeetupRecommendations}
          >
            Recommend Meetups
          </button>
        </div>

        <form onSubmit={askAI}>
          <div className="form-group">
            <label>Ask AI</label>
            <textarea
              placeholder="Example: Which community should I join? Suggest meetups for AI. How can I improve my profile?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <button className="primary-btn" type="submit">
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </form>

        {loading && (
          <div className="ai-box">
            <h3>AI is thinking...</h3>
            <p>Please wait while AI prepares the response.</p>
          </div>
        )}

        {!loading && renderAIResponse()}
      </div>
    </div>
  );
}

export default AIAssistant;