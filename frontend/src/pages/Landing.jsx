import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      emoji: "🎓",
      title: "Campus Focused",
      text: "Connect only with students from your university and department.",
    },
    {
      emoji: "🤝",
      title: "Friendship First",
      text: "Built for study partners, project teammates and genuine friendships — not dating.",
    },
    {
      emoji: "🔒",
      title: "Safe & Simple",
      text: "Mutual matching, block & report features keep the community safe.",
    },
  ];

  const steps = [
    {
      n: "1",
      title: "Create Profile",
      text: "Add your department, interests, skills and what you’re looking for.",
    },
    {
      n: "2",
      title: "Swipe & Match",
      text: "Like people you want to connect with. Match only happens when both like each other.",
    },
    {
      n: "3",
      title: "Start Chatting",
      text: "Once matched, you can message and start building real connections.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6F0] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center overflow-hidden">
        <div className="animate-float-slow pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-[#E07A3D]/10" />
        <div className="animate-float-slower pointer-events-none absolute bottom-[-4rem] -left-16 w-72 h-72 rounded-full bg-[#E07A3D]/10" />

        <h1 className="animate-fade-in-up relative text-4xl md:text-5xl font-bold text-[#5C3A21] leading-tight">
          Find Your Next <span className="text-[#E07A3D]">Friend</span> at University
        </h1>
        <p
          className="animate-fade-in-up relative mt-6 text-lg text-[#8B5E3C] max-w-2xl mx-auto"
          style={{ animationDelay: "0.1s" }}
        >
          FriendLoop helps university students connect with study partners, project teammates,
          and people who share the same interests — in a safe and friendly way.
        </p>

        <div
          className="animate-fade-in-up relative mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          style={{ animationDelay: "0.2s" }}
        >
          {user ? (
            <Link
              to="/discover"
              className="px-8 py-3 bg-[#E07A3D] text-white rounded-full font-medium text-lg transition-all duration-200 hover:bg-[#C45C26] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Discovering
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-[#E07A3D] text-white rounded-full font-medium text-lg transition-all duration-200 hover:bg-[#C45C26] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-[#E07A3D] text-[#E07A3D] rounded-full font-medium text-lg transition-all duration-200 hover:bg-[#FFF5EB] hover:-translate-y-0.5 active:translate-y-0"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="animate-fade-in-up text-3xl font-bold text-center text-[#5C3A21] mb-12">
          Why FriendLoop?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-in-up bg-white p-6 rounded-2xl shadow-sm border border-[#F0E0D0] transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-[#E07A3D]/30"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="w-12 h-12 bg-[#FDF0E6] rounded-full flex items-center justify-center text-2xl mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                {f.emoji}
              </div>
              <h3 className="text-xl font-semibold text-[#5C3A21] mb-2">{f.title}</h3>
              <p className="text-[#8B5E3C]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="animate-fade-in-up text-3xl font-bold text-[#5C3A21] mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="animate-fade-in-up group"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="text-3xl font-bold text-[#E07A3D] mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 w-fit">
                  {s.n}
                </div>
                <h3 className="font-semibold text-[#5C3A21] mb-1">{s.title}</h3>
                <p className="text-[#8B5E3C] text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="animate-fade-in-up text-3xl font-bold text-[#5C3A21] mb-6">
          Ready to find your people?
        </h2>
        {!user && (
          <Link
            to="/register"
            className="animate-fade-in-up inline-block px-10 py-3.5 bg-[#E07A3D] text-white rounded-full font-medium text-lg transition-all duration-200 hover:bg-[#C45C26] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            style={{ animationDelay: "0.1s" }}
          >
            Join FriendLoop Now
          </Link>
        )}
      </section>
    </div>
  );
};

export default Landing;