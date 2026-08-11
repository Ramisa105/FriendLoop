import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-[#F0E0D0] px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <Link to="/" className="text-2xl font-bold text-[#E07A3D]">
        FriendLoop
      </Link>

      <div className="flex items-center gap-6">
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
          <>
            <Link to="/login" className="text-[#5C3A21] hover:text-[#E07A3D] font-medium">
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