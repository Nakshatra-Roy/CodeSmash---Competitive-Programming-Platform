import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar.js";
import { AuthProvider } from './context/authContext';
import { SocketProvider } from "./context/socketProvider";
import toast, { Toaster } from 'react-hot-toast';

import "./App.css";
import Landing from "./pages/Landing";
import Contests from "./pages/Contests";
import Problems from "./pages/Problems";
import CreateProblem from "./pages/CreateProblem";
import ProblemView from "./pages/ProblemView";
import ContestView from "./pages/ContestView";
import CreateContest from "./pages/CreateContest";
import Submissions from "./pages/Submissions";
import SubmissionView from "./pages/SubmissionView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminContests from "./pages/AdminContests";
import AdminProblems from "./pages/AdminProblems";
import AdminSubmissions from "./pages/AdminSubmissions";
import { AdminRoute } from "./components/AdminRoute";
import AdminUsers from "./pages/AdminUsers";

function AppContent() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: "1rem", position: "relative", zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={<ContestView />} />
          <Route path="/contests/new" element={<CreateContest />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/new" element={<CreateProblem />} />
          <Route path="/problems/:id" element={<ProblemView />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/submissions/:id" element={<SubmissionView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/contests" element={
            <AdminRoute>
              <AdminContests />
            </AdminRoute>
          } />
          <Route path="/admin/problems" element={
            <AdminRoute>
              <AdminProblems />
            </AdminRoute>
          } />
          <Route path="/admin/submissions" element={
            <AdminRoute>
              <AdminSubmissions />
            </AdminRoute>
          } />
        </Routes>
      </div>
      </>
  );
}

function App() {
  return (
      <AuthProvider>
        <SocketProvider>
        <Router>
          <AppContent />
        </Router>
        </SocketProvider>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          />
      </AuthProvider>
  );
}
export default App;