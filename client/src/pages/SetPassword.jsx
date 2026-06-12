import { useState } from "react";
import API from "../services/api";

function SetPassword() {
  const user = JSON.parse(localStorage.getItem("meetbridge_user") || "null");

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (form.new_password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/set-password", {
        current_password: form.current_password,
        new_password: form.new_password,
      });

      localStorage.setItem("meetbridge_token", res.data.token);
      localStorage.setItem("meetbridge_user", JSON.stringify(res.data.user));

      window.dispatchEvent(new Event("authChanged"));

      setMessage(res.data.message || "Password set successfully");

      setForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.log("Set password error:", error.response?.data);
      setError(error.response?.data?.detail || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={submitPassword}>
        <h1>Set Password</h1>

        <p>
          Logged in as <strong>{user?.email}</strong>
        </p>

        <p>
          If this is your Google account, leave current password empty and set a
          new password.
        </p>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Current Password</label>
          <input
            name="current_password"
            type="password"
            placeholder="Leave empty for Google account first time"
            value={form.current_password}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            name="new_password"
            type="password"
            placeholder="Enter new password"
            value={form.new_password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm new password"
            value={form.confirm_password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}

export default SetPassword;