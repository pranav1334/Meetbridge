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
import AIFeatures from "./pages/AIFeatures";
import AIChatBox from "./pages/AIChatBox";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Messages from "./pages/Messages";
import CommunityChat from "./pages/CommunityChat";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./admin/AdminDashboard";
import CreateCommunity from "./admin/CreateCommunity";
import ManageCommunities from "./admin/ManageCommunities";
import EditCommunity from "./admin/EditCommunity";
import JoinRequests from "./admin/JoinRequests";
import CreateMeetup from "./admin/CreateMeetup";
import ManageMeetups from "./admin/ManageMeetups";
import MeetupAnalytics from "./admin/MeetupAnalytics";

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
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members/:id"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community-chat/:communityId"
          element={
            <ProtectedRoute>
              <CommunityChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

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
          path="/ai-features"
          element={
            <ProtectedRoute>
              <AIFeatures />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-chatbox"
          element={
            <ProtectedRoute>
              <AIChatBox />
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
          path="/admin/communities"
          element={
            <AdminRoute>
              <ManageCommunities />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/edit-community/:id"
          element={
            <AdminRoute>
              <EditCommunity />
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

        <Route
          path="/admin/meetups"
          element={
            <AdminRoute>
              <ManageMeetups />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/meetup-analytics/:id"
          element={
            <AdminRoute>
              <MeetupAnalytics />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;