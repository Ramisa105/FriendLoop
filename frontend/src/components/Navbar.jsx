import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Login/Register are full-viewport, single-screen layouts with their own
  // branding built in — the top navbar would push them past 100vh and
  // cause a scrollbar, so it's hidden on those two routes only.
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="bg-white border-b border-[#F0E0D0] px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      {/* Logo */}
      <Link
        to={user?.isAdmin ? "/admin" : "/"}
        className="text-2xl font-bold text-[#E07A3D]"
      >
        {user?.isAdmin ? "FriendLoop Admin" : "FriendLoop"}
      </Link>

      <div className="flex items-center gap-6">
        {/* LOGGED IN */}
        {user ? (
          <>
            <Link to="/discover" className="text-[#5C3A21] hover:text-[#E07A3D] font-medium">
              Discover
            </Link>
            <Link to="/profile" className="text-[#5C3A21] hover:text-[#E07A3D] font-medium">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-[#E07A3D] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#C45C26] transition"
            >
              Logout
            </button>
          </>
        ) : (
          /* NOT LOGGED IN */
          <>
            <Link
              to="/login"
              className="text-[#5C3A21] hover:text-[#E07A3D] font-medium"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-[#E07A3D] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#C45C26] transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
