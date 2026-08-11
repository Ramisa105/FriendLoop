import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDF6F0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#5C3A21] leading-tight">
          Find Your Next <span className="text-[#E07A3D]">Friend</span> at University
        </h1>
        <p className="mt-6 text-lg text-[#8B5E3C] max-w-2xl mx-auto">
          FriendLoop helps university students connect with study partners, project teammates,
          and people who share the same interests — in a safe and friendly way.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              to="/discover"
              className="px-8 py-3 bg-[#E07A3D] text-white rounded-full font-medium text-lg hover:bg-[#C45C26] transition"
            >
              Start Discovering
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-[#E07A3D] text-white rounded-full font-medium text-lg hover:bg-[#C45C26] transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-[#E07A3D] text-[#E07A3D] rounded-full font-medium text-lg hover:bg-[#FFF5EB] transition"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#5C3A21] mb-12">
          Why FriendLoop?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F0E0D0]">
            <div className="w-12 h-12 bg-[#FDF0E6] rounded-full flex items-center justify-center text-2xl mb-4">
              🎓
            </div>
            <h3 className="text-xl font-semibold text-[#5C3A21] mb-2">Campus Focused</h3>
            <p className="text-[#8B5E3C]">
              Connect only with students from your university and department.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F0E0D0]">
            <div className="w-12 h-12 bg-[#FDF0E6] rounded-full flex items-center justify-center text-2xl mb-4">
              🤝
            </div>
            <h3 className="text-xl font-semibold text-[#5C3A21] mb-2">Friendship First</h3>
            <p className="text-[#8B5E3C]">
              Built for study partners, project teammates and genuine friendships — not dating.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F0E0D0]">
            <div className="w-12 h-12 bg-[#FDF0E6] rounded-full flex items-center justify-center text-2xl mb-4">
              🔒
            </div>
            <h3 className="text-xl font-semibold text-[#5C3A21] mb-2">Safe & Simple</h3>
            <p className="text-[#8B5E3C]">
              Mutual matching, block & report features keep the community safe.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#5C3A21] mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <div className="text-3xl font-bold text-[#E07A3D] mb-2">1</div>
              <h3 className="font-semibold text-[#5C3A21] mb-1">Create Profile</h3>
              <p className="text-[#8B5E3C] text-sm">
                Add your department, interests, skills and what you’re looking for.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#E07A3D] mb-2">2</div>
              <h3 className="font-semibold text-[#5C3A21] mb-1">Swipe & Match</h3>
              <p className="text-[#8B5E3C] text-sm">
                Like people you want to connect with. Match only happens when both like each other.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#E07A3D] mb-2">3</div>
              <h3 className="font-semibold text-[#5C3A21] mb-1">Start Chatting</h3>
              <p className="text-[#8B5E3C] text-sm">
                Once matched, you can message and start building real connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-[#5C3A21] mb-6">
          Ready to find your people?
        </h2>
        {!user && (
          <Link
            to="/register"
            className="inline-block px-10 py-3.5 bg-[#E07A3D] text-white rounded-full font-medium text-lg hover:bg-[#C45C26] transition"
          >
            Join FriendLoop Now
          </Link>
        )}
      </section>
    </div>
  );
};

export default Landing;