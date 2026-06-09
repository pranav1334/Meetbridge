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
    linkedin_url: "",
    looking_for: "",
    can_help_with: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const saveLogin = (data) => {
    localStorage.setItem("meetbridge_token", data.token);
    localStorage.setItem("meetbridge_user", JSON.stringify(data.user));

    window.dispatchEvent(new Event("authChanged"));

    if (data.user.role === "admin") {
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
    setMessage("");

    try {
      const res = await API.post("/auth/register", form);
      saveLogin(res.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setMessage("");

      const res = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      saveLogin(res.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Google signup failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box large" onSubmit={registerUser}>
        <h2>Create Account</h2>
        <p>Join communities and start networking.</p>

        {message && <div className="error">{message}</div>}

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google signup failed")}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="divider">
          <span>or create account with email</span>
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            name="full_name"
            placeholder="Enter your full name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email address"
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
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
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
            placeholder="Example: Student Developer, Founder, Designer"
            value={form.profession}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Company / College</label>
          <input
            name="company_college"
            placeholder="Enter your company or college name"
            value={form.company_college}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            name="city"
            placeholder="Example: Hyderabad"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>LinkedIn URL</label>
          <input
            name="linkedin_url"
            placeholder="Paste your LinkedIn profile link"
            value={form.linkedin_url}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Short Bio</label>
          <textarea
            name="bio"
            placeholder="Write a short introduction about yourself"
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Looking For</label>
          <textarea
            name="looking_for"
            placeholder="Example: internships, co-founder, mentors, clients"
            value={form.looking_for}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Can Help With</label>
          <textarea
            name="can_help_with"
            placeholder="Example: React, Python, UI design, marketing"
            value={form.can_help_with}
            onChange={handleChange}
          />
        </div>

        <button className="primary-btn" type="submit">
          Register
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;