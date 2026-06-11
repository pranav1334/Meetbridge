import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    profession: "",
    company_college: "",
    city: "",
    bio: "",
    looking_for: "",
    can_help_with: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const saveLoginAndRedirect = (data) => {
    const token = data.token;
    const user = data.user;

    if (!token) {
      setMessage("Login token missing from backend response");
      return;
    }

    if (!user) {
      setMessage("User data missing from backend response");
      return;
    }

    localStorage.setItem("meetbridge_token", token);
    localStorage.setItem("meetbridge_user", JSON.stringify(user));

    window.dispatchEvent(new Event("authChanged"));

    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/register", {
        ...form,
        email: form.email.trim().toLowerCase(),
      });

      saveLoginAndRedirect(res.data);
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setMessage(detail.map((item) => item.msg).join(", "));
      } else {
        setMessage(detail || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleRegister = async (credentialResponse) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/google", {
        token: credentialResponse.credential,
      });

      saveLoginAndRedirect(res.data);
    } catch (error) {
      console.log("GOOGLE REGISTER ERROR:", error.response?.data);
      setMessage(error.response?.data?.detail || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={registerUser}>
        <h1>Create Account</h1>
        <p>Join communities and start networking.</p>

        {message && <div className="error">{message}</div>}

        <GoogleLogin
          onSuccess={googleRegister}
          onError={() => setMessage("Google registration failed")}
        />

        <div className="divider">or create account with email</div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            name="full_name"
            type="text"
            placeholder="Enter your full name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <div className="password-box">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={form.password}
              onChange={handleChange}
              required
              minLength="6"
            />

            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Profession</label>
          <input
            name="profession"
            type="text"
            placeholder="Student, Developer, Founder..."
            value={form.profession}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Company / College</label>
          <input
            name="company_college"
            type="text"
            placeholder="Your college or company"
            value={form.company_college}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            name="city"
            type="text"
            placeholder="Your city"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            placeholder="Short bio about yourself"
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Looking For</label>
          <textarea
            name="looking_for"
            placeholder="Example: co-founder, internship, team members, mentors"
            value={form.looking_for}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Can Help With</label>
          <textarea
            name="can_help_with"
            placeholder="Example: React, AI, design, startup ideas"
            value={form.can_help_with}
            onChange={handleChange}
          />
        </div>

        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;