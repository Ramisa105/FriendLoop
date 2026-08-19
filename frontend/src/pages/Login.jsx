import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/discover");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't log you in. Please check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative h-screen w-full flex overflow-hidden bg-[#FDF6F0]"
      style={{ height: "100dvh" }}
    >
      <div className="hero-orb hero-orb-one pointer-events-none absolute opacity-60" />
      <div className="hero-orb hero-orb-two pointer-events-none absolute opacity-40" />

      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-gradient-to-br from-[#E07A3D] via-[#D9713A] to-[#C45C26] text-white px-12 py-10 overflow-hidden shadow-[0_20px_50px_rgba(224,122,61,0.18)]">
        {/* Decorative shapes */}
        <div className="animate-float-slow pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
        <div className="animate-float-slower pointer-events-none absolute bottom-[-6rem] left-[-4rem] w-72 h-72 rounded-full bg-white/10" />
        <div className="animate-pulse-soft pointer-events-none absolute top-1/3 left-10 w-24 h-24 rounded-3xl bg-white/10 rotate-12" />

        <Link
          to="/"
          className="animate-fade-in-up relative text-2xl font-bold tracking-tight transition-transform hover:scale-105 w-fit"
        >
          FriendLoop
        </Link>

        <div className="relative max-w-md mx-auto text-center">
          <h1
            className="animate-fade-in-up text-4xl font-bold leading-tight mb-8"
            style={{ animationDelay: "0.1s" }}
          >
            Your people are already on campus.
          </h1>
          <p
            className="animate-fade-in-up text-lg text-white/90"
            style={{ animationDelay: "0.2s" }}
          >
            Log back in to keep chatting with study partners, project teammates,
            and friends who share your interests.
          </p>

          <div
            className="animate-fade-in-up mt-8 flex items-center justify-center gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex -space-x-3">
              {["🎓", "🤝", "💬"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-lg transition-transform hover:scale-110 hover:-translate-y-0.5"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/85">
              Trusted by students across dozens of universities
            </p>
          </div>
        </div>

        <p className="relative text-sm text-white/70">
          &copy; {new Date().getFullYear()} FriendLoop. Built for real campus
          connections.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10 overflow-y-auto">
        <div className="animate-scale-in w-full max-w-md rounded-3xl border border-[#F0E0D0] bg-white/80 p-6 shadow-[0_20px_40px_rgba(92,58,33,0.08)] backdrop-blur-sm sm:p-7">
          <Link
            to="/"
            className="lg:hidden inline-block mb-6 text-2xl font-bold text-[#E07A3D] transition-transform hover:scale-105"
          >
            FriendLoop
          </Link>

          <h2 className="text-3xl font-bold text-[#5C3A21]">Welcome back</h2>
          <p className="mt-2 text-[#8B5E3C]">
            Log in to continue discovering new connections.
          </p>

          {error && (
            <div
              role="alert"
              className="animate-fade-in-up mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#5C3A21] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E4D3C2] bg-white px-3.5 py-2.5 text-[#5C3A21] placeholder-[#B79778] shadow-sm outline-none transition focus:border-[#E07A3D] focus:ring-2 focus:ring-[#E07A3D]/25"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#5C3A21]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs font-medium text-[#E07A3D] hover:text-[#C45C26] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E4D3C2] bg-white px-3.5 py-2.5 text-[#5C3A21] placeholder-[#B79778] shadow-sm outline-none transition focus:border-[#E07A3D] focus:ring-2 focus:ring-[#E07A3D]/25"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#E07A3D] py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#C45C26] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#E07A3D] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8B5E3C]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#E07A3D] hover:text-[#C45C26] hover:underline underline-offset-2 transition-colors"
            >
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
