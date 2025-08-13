import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar.js";

import "./App.css";
import Landing from "./pages/Landing";
import Contests from "./pages/Contests";
import Problems from "./pages/Problems";
import ProblemView from "./pages/ProblemView";
import ContestView from "./pages/ContestView";
import Submissions from "./pages/Submissions";
import SubmissionView from "./pages/SubmissionView";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container" style={{ padding: "1rem", position: "relative", zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={<ContestView />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemView />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/submissions/:id" element={<SubmissionView />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;