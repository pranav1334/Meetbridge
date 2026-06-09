import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const saveLogin = (data) => {
    localStorage.setItem("meetbridge_token", data.token);
    localStorage.setItem("meetbridge_user", JSON.stringify(data.user));

    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }

    window.location.reload();
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      saveLogin(res.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Login failed");
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
      setMessage(error.response?.data?.detail || "Google login failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={loginUser}>
        <h2>Login</h2>
        <p>Welcome back to MeetBridge.</p>

        {message && <div className="error">{message}</div>}

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google login failed")}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="divider">
          <span>or login with email</span>
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
              placeholder="Enter your password"
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

        <button className="primary-btn" type="submit">
          Login
        </button>

        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;