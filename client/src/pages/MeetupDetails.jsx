import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function MeetupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("meetbridge_token");
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");
  const isAdmin = user?.role === "admin";

  const [meetup, setMeetup] = useState(null);
  const [registeredMembers, setRegisteredMembers] = useState([]);
  const [checkedInData, setCheckedInData] = useState({
    count: 0,
    checked_in_members: [],
  });

  const [form, setForm] = useState({
    meetup_id: Number(id),
    reason: "",
    want_to_learn: "",
    contribution: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMeetup = useCallback(async () => {
    try {
      const res = await API.get(`/meetups/${id}`);
      setMeetup(res.data);
    } catch {
      setError("Meetup not found");
    }
  }, [id]);

  const fetchRegisteredMembers = useCallback(async () => {
    try {
      const res = await API.get(`/meetups/${id}/registered-members`);
      setRegisteredMembers(res.data);
    } catch {
      setRegisteredMembers([]);
    }
  }, [id]);

  const fetchCheckedInMembers = useCallback(async () => {
    try {
      const res = await API.get(`/meetups/${id}/checked-in-members`);
      setCheckedInData(res.data);
    } catch {
      setCheckedInData({
        count: 0,
        checked_in_members: [],
      });
    }
  }, [id]);

  useEffect(() => {
    const loadMeetup = async () => {
      await fetchMeetup();

      if (token) {
        await fetchRegisteredMembers();
        await fetchCheckedInMembers();
      }
    };

    loadMeetup();
  }, [fetchMeetup, fetchRegisteredMembers, fetchCheckedInMembers, token]);

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

      setForm({
        meetup_id: Number(id),
        reason: "",
        want_to_learn: "",
        contribution: "",
      });

      fetchMeetup();
      fetchRegisteredMembers();
    } catch (error) {
      setError(error.response?.data?.detail || "Registration failed");
    }
  };

  const checkIn = async () => {
    setMessage("");
    setError("");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await API.post(`/meetups/${id}/check-in`);

      setMessage(res.data.message || "Check-in successful");

      fetchMeetup();
      fetchRegisteredMembers();
      fetchCheckedInMembers();
    } catch (error) {
      setError(error.response?.data?.detail || "Check-in failed");
    }
  };

  const downloadCSV = async (type) => {
    try {
      setError("");
      setMessage("");

      const endpoint =
        type === "attendees"
          ? `/meetups/${id}/export/attendees`
          : `/meetups/${id}/export/responses`;

      const res = await API.get(endpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        type === "attendees"
          ? `meetup_${id}_attendees.csv`
          : `meetup_${id}_responses.csv`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("CSV downloaded successfully");
    } catch {
      setError("CSV download failed. Please login as admin and try again.");
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
          <span>{meetup.registration_count || 0} Registered</span>
          <span>{meetup.checkin_count || 0} Checked In</span>
          <span>{meetup.attendance_percentage || 0}% Attendance</span>
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
          <h2>Admin Meetup Controls</h2>
          <p>
            Admin can view registrations, checked-in attendees, analytics, and
            export CSV reports.
          </p>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <div className="admin-actions">
            <Link to={`/admin/meetup-analytics/${id}`} className="primary-btn">
              View Analytics
            </Link>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => downloadCSV("attendees")}
            >
              Export Attendees CSV
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => downloadCSV("responses")}
            >
              Export Responses CSV
            </button>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: "24px" }}>
        <h2>Registered Members</h2>
        <p>People who registered for this meetup.</p>

        {registeredMembers.length === 0 ? (
          <p>No registered members visible yet.</p>
        ) : (
          <div className="grid">
            {registeredMembers.map((member) => (
              <div className="card" key={member.registration_id}>
                <h3>{member.full_name}</h3>

                <div className="tags">
                  {member.profession && <span>{member.profession}</span>}
                  {member.city && <span>{member.city}</span>}
                  <span>{member.status}</span>
                </div>

                <p>
                  <strong>Company / College:</strong>{" "}
                  {member.company_college || "Not added"}
                </p>

                <p>
                  <strong>Looking For:</strong>{" "}
                  {member.looking_for || "Not added"}
                </p>

                <div className="admin-actions">
                  <Link
                    to={`/members/${member.user_id}`}
                    className="primary-btn"
                  >
                    Open Profile
                  </Link>

                  <Link
                    to={`/messages?user=${member.user_id}`}
                    className="secondary-btn"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: "24px" }}>
        <h2>Live Checked-in Members</h2>
        <p>{checkedInData.count} people currently checked in.</p>

        {checkedInData.checked_in_members.length === 0 ? (
          <p>No checked-in members visible yet.</p>
        ) : (
          <div className="grid">
            {checkedInData.checked_in_members.map((member) => (
              <div className="card" key={member.attendance_id}>
                <h3>{member.full_name}</h3>

                <div className="tags">
                  {member.profession && <span>{member.profession}</span>}
                  {member.city && <span>{member.city}</span>}
                  <span>Checked In</span>
                </div>

                <p>
                  <strong>Company / College:</strong>{" "}
                  {member.company_college || "Not added"}
                </p>

                <p>
                  <strong>Can Help With:</strong>{" "}
                  {member.can_help_with || "Not added"}
                </p>

                <div className="admin-actions">
                  <Link
                    to={`/members/${member.user_id}`}
                    className="primary-btn"
                  >
                    Open Profile
                  </Link>

                  <Link
                    to={`/messages?user=${member.user_id}`}
                    className="secondary-btn"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetupDetails;