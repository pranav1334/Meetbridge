import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page">
      <div className="panel">
        <h1 className="page-title">404</h1>
        <p className="page-subtitle">Page not found.</p>
        <Link to="/" className="primary-btn">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;