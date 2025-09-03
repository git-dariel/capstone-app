import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  HomePage,
  SignInPage,
  SignUpPage,
  ConsentPage,
  ConsentRecordsPage,
  MentalHealthResultsPage,
  DashboardPage,
  ReportsPage,
  AccountsPage,
  ResourcesPage,
  HelpSupportPage,
  HistoryPage,
  InsightsPage,
  AidFunctionPage,
  StudentsPage,
  MessagesPage,
  AppointmentsPage,
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

          {/* Consent routes - protected but don't require consent completion */}
          <Route
            path="/consent"
            element={
              <ProtectedRoute>
                <ConsentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consent/results"
            element={
              <ProtectedRoute>
                <MentalHealthResultsPage />
              </ProtectedRoute>
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
            path="/students"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consent-records"
            element={
              <ProtectedRoute>
                <ConsentRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AccountsPage />
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
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Aid Function routes - for guidance counselors and admins */}
          <Route
            path="/aid-function"
            element={
              <ProtectedRoute>
                <AidFunctionPage />
              </ProtectedRoute>
            }
          />

          {/* Insights routes */}
          <Route
            path="/insights/:type"
            element={
              <ProtectedRoute>
                <InsightsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
