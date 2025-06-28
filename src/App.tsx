import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  HomePage,
  SignInPage,
  SignUpPage,
  DashboardPage,
  ReportsPage,
  ResourcesPage,
  HelpSupportPage,
} from "@/pages";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/help-support" element={<HelpSupportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
