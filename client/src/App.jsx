import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Communities from "./pages/Communities";
import CommunityDetails from "./pages/CommunityDetails";
import Meetups from "./pages/Meetups";
import MeetupDetails from "./pages/MeetupDetails";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./admin/AdminDashboard";
import CreateCommunity from "./admin/CreateCommunity";
import JoinRequests from "./admin/JoinRequests";
import CreateMeetup from "./admin/CreateMeetup";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/:id" element={<CommunityDetails />} />

        <Route path="/meetups" element={<Meetups />} />
        <Route path="/meetups/:id" element={<MeetupDetails />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/create-community"
          element={
            <AdminRoute>
              <CreateCommunity />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/join-requests"
          element={
            <AdminRoute>
              <JoinRequests />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/create-meetup"
          element={
            <AdminRoute>
              <CreateMeetup />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;