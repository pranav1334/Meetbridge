import { useEffect, useState } from "react";
import API from "../services/api";

function JoinRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchJoinRequests = async () => {
    try {
      setError("");
      setMessage("");

      const res = await API.get("/join-requests/");
      setRequests(res.data);
    } catch (error) {
      console.log("Join requests fetch error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to load join requests");
    }
  };

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const approveRequest = async (requestId) => {
    try {
      setError("");
      setMessage("");

      const res = await API.patch(`/join-requests/${requestId}/approve`);

      setMessage(res.data.message || "Join request approved");
      fetchJoinRequests();
    } catch (error) {
      console.log("Approve error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to approve request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setError("");
      setMessage("");

      const res = await API.patch(`/join-requests/${requestId}/reject`);

      setMessage(res.data.message || "Join request rejected");
      fetchJoinRequests();
    } catch (error) {
      console.log("Reject error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to reject request");
    }
  };

  const deleteRequest = async (requestId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this join request?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const res = await API.delete(`/join-requests/${requestId}`);

      setMessage(res.data.message || "Join request deleted");
      fetchJoinRequests();
    } catch (error) {
      console.log("Delete error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to delete request");
    }
  };

  const pendingRequests = requests.filter((item) => item.status === "pending");

  const completedRequests = requests.filter(
    (item) => item.status === "approved" || item.status === "rejected"
  );

  const RequestCard = ({ item }) => (
    <div className="card">
      <div className="tags">
        <span>ID: {item.id}</span>
        <span>{item.status}</span>
        <span>Score: {item.ai_score ?? "N/A"}</span>
        <span>AI: {item.ai_decision || "N/A"}</span>
        <span>Spam: {item.ai_spam_risk || "N/A"}</span>
      </div>

      <h3>{item.user_name}</h3>

      <p>
        <strong>Email:</strong> {item.user_email}
      </p>

      <p>
        <strong>Community:</strong> {item.community_name}
      </p>

      <p>
        <strong>Why wants to join:</strong> {item.reason}
      </p>

      <p>
        <strong>Contribution:</strong> {item.contribution}
      </p>

      {item.ai_summary && (
        <div className="ai-box">
          <h4>AI Review</h4>
          <p>{item.ai_summary}</p>
        </div>
      )}

      <div className="admin-actions">
        {item.status === "pending" && (
          <>
            <button
              type="button"
              className="primary-btn"
              onClick={() => approveRequest(item.id)}
            >
              Approve
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => rejectRequest(item.id)}
            >
              Reject
            </button>
          </>
        )}

        <button
          type="button"
          className="secondary-btn"
          onClick={() => deleteRequest(item.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Join Requests</h1>
      <p className="page-subtitle">
        Admin can approve or reject community join requests. AI gives score and
        decision suggestion.
      </p>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <h2>Pending Requests</h2>

      {pendingRequests.length === 0 ? (
        <div className="panel">
          <h3>No pending join requests</h3>
          <p>All join requests are already approved or rejected.</p>
        </div>
      ) : (
        <div className="grid">
          {pendingRequests.map((item) => (
            <RequestCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: "34px" }}>Approved / Rejected Requests</h2>

      {completedRequests.length === 0 ? (
        <div className="panel">
          <h3>No completed requests</h3>
          <p>Approved and rejected requests will appear here.</p>
        </div>
      ) : (
        <div className="grid">
          {completedRequests.map((item) => (
            <RequestCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default JoinRequests;