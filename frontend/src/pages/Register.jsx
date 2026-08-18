import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/profile"); // After register, go to complete profile
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDF6F0]">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-gradient-to-br from-[#E07A3D] via-[#D9713A] to-[#C45C26] text-white px-12 py-12 overflow-hidden">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-[-5rem] right-[-3rem] w-80 h-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-1/3 right-14 w-20 h-20 rounded-3xl bg-white/10 -rotate-12" />

        <Link to="/" className="relative text-2xl font-bold tracking-tight">
          FriendLoop
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Join a campus community built for real friendships.
          </h1>
          <p className="text-lg text-white/90">
            Create a profile, share your interests, and start matching with
            students who get you.
          </p>

          <ul className="mt-10 space-y-3 text-white/90 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                ✓
              </span>
              Free to join — takes less than a minute
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                ✓
              </span>
              Matches only within your university
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                ✓
              </span>
              Built-in block &amp; report tools for safety
            </li>
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          &copy; {new Date().getFullYear()} FriendLoop. Built for real campus connections.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden inline-block mb-8 text-2xl font-bold text-[#E07A3D]"
          >
            FriendLoop
          </Link>

          <h2 className="text-3xl font-bold text-[#5C3A21]">Create your account</h2>
          <p className="mt-2 text-[#8B5E3C]">
            Start meeting students who share your interests.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#5C3A21] mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E4D3C2] bg-white px-3.5 py-2.5 text-[#5C3A21] placeholder-[#B79778] shadow-sm outline-none transition focus:border-[#E07A3D] focus:ring-2 focus:ring-[#E07A3D]/25"
                placeholder="Your name"
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#5C3A21] mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-[#E4D3C2] bg-white px-3.5 py-2.5 text-[#5C3A21] placeholder-[#B79778] shadow-sm outline-none transition focus:border-[#E07A3D] focus:ring-2 focus:ring-[#E07A3D]/25"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#5C3A21] mb-1.5"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[#5C3A21] placeholder-[#B79778] shadow-sm outline-none transition focus:ring-2 ${
                    passwordsMatch
                      ? "border-[#E4D3C2] focus:border-[#E07A3D] focus:ring-[#E07A3D]/25"
                      : "border-red-300 focus:border-red-400 focus:ring-red-200"
                  }`}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#8B5E3C]">
              <input
                type="checkbox"
                onChange={() => setShowPassword((s) => !s)}
                checked={showPassword}
                className="h-4 w-4 rounded border-[#E4D3C2] text-[#E07A3D] focus:ring-[#E07A3D]/40"
              />
              Show password
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#E07A3D] py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#C45C26] focus-visible:outline-2 focus-visible:outline-[#E07A3D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>

            <p className="text-center text-xs text-[#B79778]">
              By signing up, you agree to keep interactions respectful and
              follow FriendLoop's community guidelines.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-[#8B5E3C]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#E07A3D] hover:text-[#C45C26] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
