import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("meetbridge_token");

  const user = JSON.parse(
    localStorage.getItem("meetbridge_user") || "null"
  );

  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;