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
import { ProtectedRoute, PublicRoute } from "@/components";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - redirect to signin for unauthenticated users */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Public routes - redirect to home if already authenticated */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />

          {/* Protected home page */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help-support"
            element={
              <ProtectedRoute>
                <HelpSupportPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
