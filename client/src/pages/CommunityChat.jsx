import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import API from "../services/api";

function CommunityChat() {
  const { communityId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");
  const isAdmin = user?.role === "admin";

  const tabFromUrl = searchParams.get("tab") || "general";

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const tabs = [
    { key: "general", label: "General Chat" },
    { key: "opportunity", label: "Opportunities" },
    { key: "announcement", label: "Announcements" },
  ];

  const fetchMessages = useCallback(async () => {
    try {
      const res = await API.get(`/messages/community/${communityId}`, {
        params: {
          message_type: activeTab,
        },
      });

      setMessages(res.data);
    } catch (error) {
      setMessages([]);
      setError(error.response?.data?.detail || "Failed to load community chat");
    }
  }, [activeTab, communityId]);

  useEffect(() => {
    const loadChat = async () => {
      setSearchParams({ tab: activeTab });
      await fetchMessages();
    };

    loadChat();
  }, [activeTab, fetchMessages, setSearchParams]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Message cannot be empty");
      return;
    }

    try {
      setMessage("");
      setError("");

      const res = await API.post("/messages/community", {
        community_id: Number(communityId),
        content,
        message_type: activeTab,
      });

      setMessage(res.data.message || "Message sent");
      setContent("");

      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to send message");
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await API.delete(`/messages/${messageId}`);
      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to delete message");
    }
  };

  const reportMessage = async (messageId) => {
    try {
      const res = await API.patch(`/messages/${messageId}/report`);
      setMessage(res.data.message || "Message reported");
      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to report message");
    }
  };

  const pinMessage = async (messageId) => {
    try {
      const res = await API.patch(`/messages/${messageId}/pin`);
      setMessage(res.data.message || "Message pin updated");
      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to pin message");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Community Chat</h1>
      <p className="page-subtitle">
        Community ID: {communityId}. Use general chat, opportunities, and announcements.
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="chat-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "active-tab" : ""}
            onClick={() => {
              setActiveTab(tab.key);
              setMessage("");
              setError("");
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="chat-box">
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className={item.mine ? "chat-message mine" : "chat-message"}
              >
                <div className="chat-header">
                  <strong>{item.sender_name}</strong>
                  {item.is_pinned && <span className="pin-badge">Pinned</span>}
                </div>

                <p>{item.content}</p>

                <div className="chat-actions">
                  <Link to={`/members/${item.sender_id}`}>Profile</Link>

                  {isAdmin && (
                    <button type="button" onClick={() => pinMessage(item.id)}>
                      {item.is_pinned ? "Unpin" : "Pin"}
                    </button>
                  )}

                  {(item.mine || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => deleteMessage(item.id)}
                    >
                      Delete
                    </button>
                  )}

                  {!item.mine && (
                    <button
                      type="button"
                      onClick={() => reportMessage(item.id)}
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {activeTab === "announcement" && !isAdmin ? (
          <div className="info-box">
            Only admin can post announcements. Members can view announcements.
          </div>
        ) : (
          <form onSubmit={sendMessage} className="message-form">
            <textarea
              placeholder={
                activeTab === "opportunity"
                  ? "Post an opportunity, internship, collaboration, or startup role..."
                  : activeTab === "announcement"
                  ? "Post an official community announcement..."
                  : "Type your message..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="primary-btn" type="submit">
              {activeTab === "announcement"
                ? "Post Announcement"
                : activeTab === "opportunity"
                ? "Post Opportunity"
                : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CommunityChat;