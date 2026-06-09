import { useEffect, useState } from "react";
import API from "../services/api";

function JoinRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await API.get("/join-requests/admin/all");
      setRequests(res.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      setMessage("");
      setError("");

      await API.put(`/join-requests/${id}/approve`);

      setMessage("Join request approved");
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.detail || "Approve failed");
    }
  };

  const rejectRequest = async (id) => {
    try {
      setMessage("");
      setError("");

      await API.put(`/join-requests/${id}/reject`);

      setMessage("Join request rejected");
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.detail || "Reject failed");
    }
  };

  const runAIReview = async (id) => {
    try {
      setMessage("");
      setError("");

      await API.post(`/ai/review-join-request/${id}`);

      setMessage("AI review completed");
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.detail || "AI review failed");
    }
  };

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const completedRequests = requests.filter((req) => req.status !== "pending");

  const renderRequestCard = (req) => {
    const isPending = req.status === "pending";
    const isApproved = req.status === "approved";
    const isRejected = req.status === "rejected";

    return (
      <div className="panel request-card" key={req.id}>
        <h3>Request #{req.id}</h3>

        <div className="tags">
          <span>Status: {req.status}</span>
          <span>User ID: {req.user_id}</span>
          <span>Community ID: {req.community_id}</span>
        </div>

        <p>
          <strong>Reason:</strong> {req.reason}
        </p>

        <p>
          <strong>Contribution:</strong> {req.contribution}
        </p>

        <div className="ai-box">
          <h3>AI Review</h3>

          <p>
            <strong>Score:</strong>{" "}
            {req.ai_score !== null && req.ai_score !== undefined
              ? `${req.ai_score}/100`
              : "Not reviewed"}
          </p>

          <p>
            <strong>Decision:</strong> {req.ai_decision || "Not available"}
          </p>

          <p>
            <strong>Spam Risk:</strong> {req.ai_spam_risk || "Not available"}
          </p>

          <p>{req.ai_reason_summary || "No AI summary yet."}</p>
        </div>

        {isPending && (
          <div className="admin-actions">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => runAIReview(req.id)}
            >
              Run AI Review
            </button>

            <button
              className="primary-btn"
              type="button"
              onClick={() => approveRequest(req.id)}
            >
              Approve
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => rejectRequest(req.id)}
            >
              Reject
            </button>
          </div>
        )}

        {isApproved && (
          <div className="success">
            This join request has already been approved.
          </div>
        )}

        {isRejected && (
          <div className="error">
            This join request has already been rejected.
          </div>
        )}
      </div>
    );
  };

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
        pendingRequests.map((req) => renderRequestCard(req))
      )}

      <h2 style={{ marginTop: "36px" }}>Approved / Rejected Requests</h2>

      {completedRequests.length === 0 ? (
        <div className="panel">
          <h3>No completed requests</h3>
          <p>Approved and rejected requests will appear here.</p>
        </div>
      ) : (
        completedRequests.map((req) => renderRequestCard(req))
      )}
    </div>
  );
}

export default JoinRequests;