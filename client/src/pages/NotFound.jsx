import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page">
      <div className="panel">
        <h1 className="page-title">Page Not Found</h1>
        <p className="page-subtitle">
          The page you are looking for does not exist. Use navigation to continue.
        </p>
        <Link to="/" className="primary-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
