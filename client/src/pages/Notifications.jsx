import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");
      const res = await API.get("/notifications/");
      setNotifications(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to mark notification read");
    }
  };

  const markAllRead = async () => {
    try {
      const res = await API.patch("/notifications/mark-all/read");
      setMessage(res.data.message || "All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to mark all read");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Notifications</h1>
      <p className="page-subtitle">
        New messages, announcements, and important updates appear here.
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="admin-actions">
        <button className="primary-btn" type="button" onClick={markAllRead}>
          Mark All as Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="panel">
          <h3>No notifications</h3>
          <p>You are all caught up.</p>
        </div>
      ) : (
        <div className="grid">
          {notifications.map((item) => (
            <div
              className={item.is_read ? "card notification-read" : "card"}
              key={item.id}
            >
              <div className="tags">
                <span>{item.notification_type}</span>
                <span>{item.is_read ? "Read" : "Unread"}</span>
              </div>

              <h3>{item.title}</h3>
              <p>{item.message}</p>

              <div className="admin-actions">
                {item.target_url && (
                  <Link
                    to={item.target_url}
                    className="primary-btn"
                    onClick={() => markRead(item.id)}
                  >
                    Open Chat
                  </Link>
                )}

                {!item.is_read && (
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => markRead(item.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;