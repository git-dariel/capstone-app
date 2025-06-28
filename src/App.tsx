import { HomePage } from "@/pages/HomePage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
