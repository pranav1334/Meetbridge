import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("meetbridge_token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("meetbridge_user") || "null")
  );

  const refreshAuth = () => {
    setToken(localStorage.getItem("meetbridge_token"));
    setUser(JSON.parse(localStorage.getItem("meetbridge_user") || "null"));
  };

  useEffect(() => {
    window.addEventListener("authChanged", refreshAuth);

    return () => {
      window.removeEventListener("authChanged", refreshAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("meetbridge_token");
    localStorage.removeItem("meetbridge_user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        MeetBridge
      </Link>

      <div className="nav-links">
        <Link to="/communities">Communities</Link>
        <Link to="/meetups">Meetups</Link>

        {token && <Link to="/dashboard">Dashboard</Link>}
        {token && <Link to="/ai-assistant">AI Assistant</Link>}

        {user?.role === "admin" && <Link to="/admin">Admin</Link>}

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-btn">
              Register
            </Link>
          </>
        ) : (
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;