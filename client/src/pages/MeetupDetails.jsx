import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function MeetupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("meetbridge_token");
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");
  const isAdmin = user?.role === "admin";

  const [meetup, setMeetup] = useState(null);
  const [form, setForm] = useState({
    meetup_id: Number(id),
    reason: "",
    want_to_learn: "",
    contribution: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMeetup = async () => {
    try {
      const res = await API.get(`/meetups/${id}`);
      setMeetup(res.data);
    } catch (error) {
      setError("Meetup not found");
    }
  };

  useEffect(() => {
    fetchMeetup();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registerForMeetup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await API.post("/meetups/register", form);
      setMessage(res.data.message || "Registered successfully");
    } catch (error) {
      setError(error.response?.data?.detail || "Registration failed");
    }
  };

  const checkIn = async () => {
    setMessage("");
    setError("");

    try {
      const res = await API.post(`/meetups/${id}/check-in`);
      setMessage(res.data.message || "Check-in successful");
    } catch (error) {
      setError(error.response?.data?.detail || "Check-in failed");
    }
  };

  if (!meetup) {
    return (
      <div className="page">
        <h1 className="page-title">Loading...</h1>
        {error && <div className="error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        {meetup.banner && (
          <img
            src={meetup.banner}
            alt={meetup.title}
            className="detail-cover-image"
          />
        )}

        <h1 className="page-title">{meetup.title}</h1>
        <p className="page-subtitle">{meetup.description}</p>

        <div className="tags">
          <span>{meetup.date}</span>
          <span>
            {meetup.start_time} - {meetup.end_time}
          </span>
          <span>{meetup.venue_name}</span>
          <span>Capacity: {meetup.capacity_limit}</span>
        </div>

        {meetup.google_maps_link && (
          <a
            className="secondary-btn"
            href={meetup.google_maps_link}
            target="_blank"
            rel="noreferrer"
          >
            Open Google Maps
          </a>
        )}
      </div>

      {!isAdmin && (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h2>Register for Meetup</h2>
          <p>Only approved members of this community can register.</p>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={registerForMeetup}>
            <div className="form-group">
              <label>Why do you want to attend?</label>
              <textarea
                name="reason"
                placeholder="Explain why you want to attend this meetup"
                value={form.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>What do you want to learn?</label>
              <textarea
                name="want_to_learn"
                placeholder="Explain what you want to learn from this meetup"
                value={form.want_to_learn}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>What can you contribute?</label>
              <textarea
                name="contribution"
                placeholder="Explain how you can contribute to this meetup"
                value={form.contribution}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-actions">
              <button className="primary-btn" type="submit">
                Register
              </button>

              <button className="secondary-btn" type="button" onClick={checkIn}>
                Check In
              </button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="panel" style={{ marginTop: "24px" }}>
          <h2>Admin View</h2>
          <p>
            You are viewing this meetup as an admin. Registration and check-in
            options are hidden because admins manage meetups.
          </p>
        </div>
      )}
    </div>
  );
}

export default MeetupDetails;