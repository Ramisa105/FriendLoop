import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoMark from "./components/LogoMark";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Matches from "./pages/Matches";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Splash screen from main */}
        {showIntro && (
          <div className="splash-screen fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="splash-burst absolute inset-0" />
            <div className="splash-glow splash-glow-one" />
            <div className="splash-glow splash-glow-two" />
            <div className="splash-ring" />
            <div className="splash-sparkles" />
            <LogoMark className="splash-logo" />
          </div>
        )}

        {/* Main application */}
        <div
          className={
            showIntro ? "opacity-0" : "opacity-100 animate-fade-in-app"
          }
        >
          <Navbar />

          <div className="min-h-screen bg-[#FDF6F0]">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Discover */}
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <Discover />
                  </ProtectedRoute>
                }
              />

              {/* Matches */}
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
