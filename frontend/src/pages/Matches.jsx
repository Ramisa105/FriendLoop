import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await API.get("/matches");

        setMatches(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getProfilePicSrc = (profilePic) => {
    if (!profilePic) return "";

    if (
      profilePic.startsWith("http://") ||
      profilePic.startsWith("https://") ||
      profilePic.startsWith("data:")
    ) {
      return profilePic;
    }

    return `http://localhost:5000${profilePic}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FFEA] flex items-center justify-center">
        <p className="text-gray-500">Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FFEA] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <p className="text-[#FA855A] font-bold uppercase tracking-[0.2em] text-xs">
          FriendLoop
        </p>

        <h1 className="text-4xl font-black !text-black mt-2">Your Matches</h1>

        {/* <p className="text-gray-500 mt-2 mb-8">People who liked you back.</p> */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white rounded-[28px] p-10 text-center border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold !text-black">No matches yet</h2>

            <p className="text-gray-500 mt-2">
              Keep discovering people. Mutual likes will appear here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {matches.map((match) => (
              <div
                key={match.matchId}
                className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Profile Picture */}
                  {match.user?.profilePic ? (
                    <img
                      src={getProfilePicSrc(match.user.profilePic)}
                      alt={match.user.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#62C4DA] flex items-center justify-center">
                      <span className="text-white text-3xl font-black">
                        {match.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="text-xl font-black !text-black">
                      {match.user?.name}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {match.user?.university}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {match.user?.department}
                    </p>
                  </div>
                </div>

                {/* Interests */}
                {match.user?.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {match.user.interests.slice(0, 4).map((interest) => (
                      <span
                        key={interest}
                        className="bg-[#FFDE96]/40 border border-[#FFDE96] px-3 py-1 rounded-full text-xs font-semibold text-gray-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message button */}
                <button
                  onClick={() =>
                    navigate(`/chat/${match.user?._id}`, {
                      state: { matchUser: match.user },
                    })
                  }
                  className="w-full mt-5 bg-[#C93638] hover:bg-[#FA855A] text-white py-3 rounded-xl font-bold transition"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
