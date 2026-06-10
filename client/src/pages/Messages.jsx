import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";

function Messages() {
  const [searchParams] = useSearchParams();

  const selectedUserId = searchParams.get("user");

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    if (!selectedUserId) return;

    try {
      setError("");

      const res = await API.get(`/messages/direct/${selectedUserId}`);

      setMessages(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      setError("Select a member first");
      return;
    }

    if (!content.trim()) {
      setError("Message cannot be empty");
      return;
    }

    try {
      setMessage("");
      setError("");

      const res = await API.post("/messages/direct", {
        receiver_id: Number(selectedUserId),
        content: content.trim(),
      });

      setMessage(res.data.message || "Message sent successfully");
      setContent("");

      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to send message");
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setMessage("");
      setError("");

      await API.delete(`/messages/${messageId}`);

      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to delete message");
    }
  };

  const reportMessage = async (messageId) => {
    try {
      setMessage("");
      setError("");

      const res = await API.patch(`/messages/${messageId}/report`);

      setMessage(res.data.message || "Message reported successfully");

      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to report message");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Direct Messages</h1>
      <p className="page-subtitle">
        Private messaging between community members.
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      {!selectedUserId ? (
        <div className="panel">
          <h2>No Member Selected</h2>
          <p>
            Open a member profile or meetup attendee card and click{" "}
            <strong>Message</strong>.
          </p>

          <div className="admin-actions">
            <Link to="/members" className="primary-btn">
              Go to Members
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel">
          <h2>Conversation</h2>

          <div className="chat-box">
            {messages.length === 0 ? (
              <p>No messages yet. Start the conversation.</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={item.mine ? "chat-message mine" : "chat-message"}
                >
                  <div className="chat-header">
                    <strong>{item.sender_name}</strong>

                    {item.is_pinned && (
                      <span className="pin-badge">Pinned</span>
                    )}

                    {item.mine && item.is_read && (
                      <span className="read-badge">Read</span>
                    )}
                  </div>

                  <p>{item.content}</p>

                  <div className="chat-actions">
                    {item.mine && (
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

          <form onSubmit={sendMessage} className="message-form">
            <textarea
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="primary-btn" type="submit">
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages;