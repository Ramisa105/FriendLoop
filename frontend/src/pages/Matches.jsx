import { useEffect, useState } from "react";
import API from "../api/axios";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await API.get("/matches");

        setMatches(res.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          "Could not load your matches."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center">
        <p className="text-[#8B5E3C] text-lg">
          Loading your matches...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6F0] px-4 py-10">

      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="text-center mb-10">

          <h1 className="text-4xl font-bold !text-[#5C3A21]">
            Your Friends
          </h1>

          <p className="text-[#8B5E3C] mt-2">
            People who liked you back
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="max-w-md mx-auto mb-6 bg-red-100 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}


        {/* No Matches */}

        {matches.length === 0 && !error && (

          <div className="bg-white max-w-md mx-auto text-center p-10 rounded-3xl shadow-md border border-[#F0E0D0]">

            <div className="text-5xl mb-5">
              🤝
            </div>

            <h2 className="text-2xl font-bold !text-[#5C3A21]">
              No friends yet
            </h2>

            <p className="text-[#8B5E3C] mt-3">
              Keep discovering people. When you both like
              each other, they'll appear here.
            </p>

          </div>

        )}


        {/* Matches Grid */}

        {matches.length > 0 && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {matches.map((match) => {

              const friend = match.user;

              if (!friend) return null;

              return (

                <div
                  key={match.matchId}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-[#F0E0D0] hover:-translate-y-1 transition"
                >

                  {/* Profile Picture */}

                  <div className="h-52 bg-gradient-to-br from-[#E07A3D] to-[#C45C26] flex items-center justify-center">

                    {friend.profilePic ? (

                      <img
                        src={friend.profilePic}
                        alt={friend.name}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center">

                        <span className="text-white text-4xl font-bold">

                          {friend.name
                            ?.charAt(0)
                            .toUpperCase()}

                        </span>

                      </div>

                    )}

                  </div>


                  {/* Information */}

                  <div className="p-6">

                    <div className="flex justify-between items-start">

                      <div>

                        <h2 className="text-xl font-bold text-[#5C3A21]">
                          {friend.name}
                        </h2>

                        {friend.department && (

                          <p className="text-[#8B5E3C] text-sm mt-1">
                            {friend.department}
                          </p>

                        )}

                      </div>


                      {/* Friend Badge */}

                      <span className="bg-[#FDF0E6] text-[#C45C26] text-xs font-semibold px-3 py-1 rounded-full">

                        ✓ Friend

                      </span>

                    </div>


                    {/* University */}

                    {friend.university && (

                      <p className="text-[#A67C52] text-sm mt-3">
                        🎓 {friend.university}
                      </p>

                    )}


                    {/* Interests */}

                    {friend.interests?.length > 0 && (

                      <div className="flex flex-wrap gap-2 mt-4">

                        {friend.interests
                          .slice(0, 3)
                          .map((interest, index) => (

                            <span
                              key={index}
                              className="bg-[#FFF5EB] text-[#A67C52] text-xs px-3 py-1 rounded-full"
                            >
                              {interest}
                            </span>

                          ))}

                      </div>

                    )}


                    {/* Chat Button */}

                    <button
                      className="w-full mt-6 bg-[#E07A3D] text-white py-3 rounded-xl font-semibold hover:bg-[#C45C26] transition"
                    >
                      Message {friend.name}
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </div>
  );
};

export default Matches;