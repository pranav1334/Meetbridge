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

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      saveLoginAndRedirect(res.data);
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data);
      setMessage(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/google", {
        token: credentialResponse.credential,
      });

      saveLoginAndRedirect(res.data);
    } catch (error) {
      console.log("GOOGLE LOGIN ERROR:", error.response?.data);
      setMessage(error.response?.data?.detail || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={loginUser}>
        <h1>Login</h1>
        <p>Welcome back to MeetBridge.</p>

        {message && <div className="error">{message}</div>}

        <GoogleLogin
          onSuccess={googleLogin}
          onError={() => setMessage("Google login failed")}
        />

        <div className="divider">or login with email</div>

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

        <button className="primary-btn full" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-link">
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;