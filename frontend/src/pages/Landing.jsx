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

  const trustPoints = [
    { emoji: "🎓", label: "University verified" },
    { emoji: "🆓", label: "Free to join" },
    { emoji: "🛡️", label: "Moderated community" },
  ];

  const testimonials = [
    {
      quote:
        "Found my entire study group for finals week within two days of joining. Genuinely changed my semester.",
      name: "Priya S.",
      dept: "Computer Science, 3rd year",
    },
    {
      quote:
        "I moved to a new city for university and didn't know a soul. FriendLoop made it easy to find people in my department.",
      name: "Daniel O.",
      dept: "Mechanical Engineering, 1st year",
    },
    {
      quote:
        "It's refreshingly not a dating app. Just people who want project teammates and real friends.",
      name: "Aisha K.",
      dept: "Business Administration, 2nd year",
    },
  ];

  const swipeCards = [
    { emoji: "🎨", name: "Maya, 20", dept: "Fine Arts", tags: ["Sketching", "Coffee"] },
    { emoji: "💻", name: "Leo, 21", dept: "Computer Science", tags: ["Hackathons", "Chess"] },
    { emoji: "🎵", name: "Sara, 19", dept: "Music", tags: ["Guitar", "Study group"] },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6F0] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="animate-float-slow pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-[#E07A3D]/10" />
        <div className="animate-float-slower pointer-events-none absolute bottom-[-4rem] -left-16 w-80 h-80 rounded-full bg-[#E07A3D]/10" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy + CTAs */}
          <div className="text-center lg:text-left gap-6">
            <span className="animate-fade-in-up inline-block px-4 py-1.5 rounded-full bg-[#FDF0E6] text-[#C45C26] text-sm font-medium mb-6">
              Built exclusively for university students
            </span>

            <h1 className="animate-fade-in-up text-4xl md:text-5xl font-bold text-[#5C3A21] leading-tight">
              Find Your Next <span className="text-[#E07A3D]">Friend</span> at University
            </h1>

            <p
              className="animate-fade-in-up mt-6 text-lg text-[#8B5E3C] max-w-md mx-auto lg:mx-0"
              style={{ animationDelay: "0.1s" }}
            >
              FriendLoop helps university students connect with study partners, project teammates,
              and people who share the same interests — in a safe and friendly way.
            </p>

            <div
              className="animate-fade-in-up mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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

            <div
              className="animate-fade-in-up mt-10 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2"
              style={{ animationDelay: "0.3s" }}
            >
              {trustPoints.map((t) => (
                <span key={t.label} className="flex items-center gap-1.5 text-sm text-[#8B5E3C]">
                  <span aria-hidden="true">{t.emoji}</span>
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Tinder-style swipe card stack */}
          <div className="animate-scale-in relative h-[420px] sm:h-[460px] max-w-sm mx-auto w-full">
            {swipeCards.map((card, i) => {
              const depth = swipeCards.length - 1 - i;
              const rotate = depth === 0 ? 0 : depth === 1 ? -6 : 5;
              const translate = depth * 10;
              return (
                <div
                  key={card.name}
                  className="absolute inset-0 rounded-3xl bg-white border border-[#F0E0D0] shadow-lg flex flex-col overflow-hidden transition-transform duration-300"
                  style={{
                    transform: `rotate(${rotate}deg) translateY(${translate}px)`,
                    zIndex: 10 - depth,
                  }}
                >
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#FDF0E6] to-[#F7DCC4] text-7xl">
                    {card.emoji}
                  </div>
                  <div className="p-5">
                    <p className="text-lg font-semibold text-[#5C3A21]">{card.name}</p>
                    <p className="text-sm text-[#8B5E3C] mb-3">{card.dept}</p>
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#FDF0E6] text-[#C45C26]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating like / pass action buttons, Tinder-style */}
            <div className="animate-float-slow absolute -left-5 top-10 w-14 h-14 rounded-full bg-white shadow-lg border border-[#F0E0D0] flex items-center justify-center text-2xl z-20">
              ✕
            </div>
            <div className="animate-float-slower absolute -right-5 bottom-16 w-16 h-16 rounded-full bg-[#E07A3D] shadow-lg flex items-center justify-center text-2xl z-20">
              ❤️
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-18">
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <h2 className="animate-fade-in-up text-3xl font-bold text-[#5C3A21]">Why FriendLoop?</h2>
          <p
            className="animate-fade-in-up mt-4 text-center text-[#8B5E3C] max-w-2xl mx-auto leading-relaxed block"
            style={{ animationDelay: "0.1s" }}
          >
            Everything about FriendLoop is designed around one goal: real connections on your campus.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-in-up flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-[#F0E0D0] transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-[#E07A3D]/30"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="w-12 h-12 bg-[#FDF0E6] rounded-full flex items-center justify-center text-2xl mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                {f.emoji}
              </div>
              <h3 className="text-xl font-semibold text-[#5C3A21] mb-2">{f.title}</h3>
              <p className="text-[#8B5E3C] leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-18">
        <div className="max-w-4xl mx-auto px-6 text-center gap-8 flex flex-col items-center">
          <h2 className="animate-fade-in-up text-3xl font-bold gap-4 text-[#5C3A21] mb-16">
            How It Works
          </h2>

          <div className="relative grid md:grid-cols-3 gap-20 md:gap-20 text-center">
            <div
              className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-0.5 bg-[#F0E0D0]"
              aria-hidden="true"
            />
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="animate-fade-in-up relative group flex flex-col items-center"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#E07A3D] text-white flex items-center justify-center text-lg font-bold mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 shadow-sm">
                  {s.n}
                </div>
                <h3 className="font-semibold text-[#5C3A21] mb-1.5">{s.title}</h3>
                <p className="text-[#8B5E3C] text-sm leading-relaxed max-w-[220px]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* CTA */}
      <section className="relative overflow-hidden py-15 text-center bg-gradient-to-br from-[#E07A3D] via-[#D9713A] to-[#C45C26]">
        <div className="animate-float-slow pointer-events-none absolute -top-10 -left-10 w-64 h-64 rounded-full bg-white/10" />
        <div className="animate-float-slower pointer-events-none absolute -bottom-16 -right-10 w-72 h-72 rounded-full bg-white/10" />

        <div className="relative max-w-2xl mx-auto px-6 gap-8 flex flex-col items-center">
          <h2 className="animate-fade-in-up text-3xl font-bold text-white mb-4">
            Ready to find your people?
          </h2>
          <p
            className="animate-fade-in-up text-white/100 mb-20"
            style={{ animationDelay: "0.2s" }}
          >
            Join a growing community of students building real friendships on campus.
          </p>
          {!user && (
            <Link
              to="/register"
              className="animate-fade-in-up inline-block px-10 py-3.5 bg-white text-[#C45C26] rounded-full font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              style={{ animationDelay: "0.2s" }}
            >
              Join FriendLoop Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDF6F0] border-t border-[#F0E0D0] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-lg font-bold text-[#E07A3D]">FriendLoop</p>
          <p className="text-sm text-[#8B5E3C]">
            &copy; {new Date().getFullYear()} FriendLoop. Built for real campus connections.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;