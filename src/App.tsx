import { ProtectedRoute, PublicRoute } from "@/components";
import { SplashScreen } from "@/components/atoms";
import {
  AccountsPage,
  ActivitiesPage,
  ActivityTimerPage,
  AidFunctionPage,
  AppointmentsPage,
  ConsentPage,
  ConsentRecordsPage,
  ConsultantRecordsPage,
  DashboardPage,
  HelpSupportPage,
  HistoryPage,
  HomePage,
  InsightsPage,
  InventoryPage,
  InventoryRecordsPage,
  InventoryInsightsPage,
  LandingPage,
  MentalHealthResultsPage,
  MessagesPage,
  NotFoundPage,
  NotificationsPage,
  ProfilePage,
  ReportsPage,
  ResourcesPage,
  SignInPage,
  SignUpPage,
  StudentsPage,
  StudentDashboardPage,
} from "@/pages";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useState } from "react";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen on every app load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={2000} />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - show landing page */}
          <Route path="/" element={<LandingPage />} />

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

          {/* Inventory routes - protected but don't require completion */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/results"
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
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboardPage />
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
            path="/inventory-records"
            element={
              <ProtectedRoute>
                <InventoryRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/insights/:type"
            element={
              <ProtectedRoute>
                <InventoryInsightsPage />
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
            path="/consultant-records"
            element={
              <ProtectedRoute>
                <ConsultantRecordsPage />
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
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
            path="/activities"
            element={
              <ProtectedRoute>
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-timer"
            element={
              <ProtectedRoute>
                <ActivityTimerPage />
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

          {/* 404 Catch-all route - must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
