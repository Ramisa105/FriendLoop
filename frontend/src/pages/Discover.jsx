import { useState, useEffect } from "react";
import API from "../api/axios";


// ======================================================
// HELPER FUNCTIONS
// ======================================================

// Convert text to lowercase and remove extra spaces
// Example: " Gaming " → "gaming"
const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();


// Check whether two arrays have at least one common item
// Example:
// ["Gaming", "Coding"] and ["Football", "Gaming"]
// Result → true
const arraysHaveCommonItem = (first = [], second = []) => {
  const normalizedFirst = first
    .map(normalize)
    .filter(Boolean);

  return second.some((item) =>
    normalizedFirst.includes(normalize(item))
  );
};


// Check whether I have at least one thing in common
// with another user
const hasSomethingInCommon = (me, otherUser) => {

  // Same university
  const sameUniversity =
    me.university &&
    otherUser.university &&
    normalize(me.university) === normalize(otherUser.university);


  // Same department
  const sameDepartment =
    me.department &&
    otherUser.department &&
    normalize(me.department) === normalize(otherUser.department);


  // At least one common interest
  const commonInterest = arraysHaveCommonItem(
    me.interests,
    otherUser.interests
  );


  // At least one common skill
  const commonSkill = arraysHaveCommonItem(
    me.skills,
    otherUser.skills
  );


  // At least one common friendship goal
  const commonGoal = arraysHaveCommonItem(
    me.friendshipGoals,
    otherUser.friendshipGoals
  );


  // Only ONE match is required
  return (
    sameUniversity ||
    sameDepartment ||
    commonInterest ||
    commonSkill ||
    commonGoal
  );
};


// ======================================================
// DISCOVER COMPONENT
// ======================================================

const Discover = () => {

  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState(null);


  // ======================================================
  // FETCH AND FILTER SUGGESTIONS
  // ======================================================

  useEffect(() => {

    const fetchSuggestions = async () => {

      try {

        // Get:
        // 1. My complete profile
        // 2. All available suggestions
        const [meRes, suggestionsRes] = await Promise.all([
          API.get("/users/me"),
          API.get("/users/suggestions"),
        ]);


        const myProfile = meRes.data;
        const allSuggestions = suggestionsRes.data;


        // Apply FriendLoop discovery rules
        const filteredSuggestions = allSuggestions.filter(
          (otherUser) => {

            // RULE 1:
            // Admin accounts must NEVER appear
            if (otherUser.isAdmin) {
              return false;
            }


            // RULE 2:
            // User must have at least ONE thing
            // in common with me
            return hasSomethingInCommon(
              myProfile,
              otherUser
            );
          }
        );


        setSuggestions(filteredSuggestions);

      } catch (err) {

        console.error(
          "Error fetching suggestions:",
          err
        );

      } finally {

        setLoading(false);

      }
    };


    fetchSuggestions();

  }, []);


  // Current profile being displayed
  const currentUser = suggestions[currentIndex];


  // ======================================================
  // SWIPE / LIKE
  // ======================================================

  const handleSwipe = async (liked) => {

    if (!currentUser) return;


    // If user presses Like
    if (liked) {

      try {

        const res = await API.post(
          `/matches/like/${currentUser._id}`
        );


        // If both users liked each other
        if (res.data.matched) {

          setMatchPopup(currentUser);

        }

      } catch (err) {

        console.error(
          "Error liking user:",
          err
        );

      }
    }


    // Move to next profile
    setCurrentIndex(
      (prev) => prev + 1
    );
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6F0]">

        <p className="text-[#8B5E3C] text-lg">
          Loading profiles...
        </p>

      </div>
    );
  }


  // ======================================================
  // NO MORE PROFILES
  // ======================================================

  if (!currentUser) {

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6F0] px-4">

        <h2 className="text-2xl font-bold text-[#5C3A21] mb-2">
          No more profiles
        </h2>

        <p className="text-[#8B5E3C]">
          No users with common interests, skills or university found.
        </p>

      </div>
    );
  }


  // ======================================================
  // DISCOVER PAGE
  // ======================================================

  return (

    <div className="min-h-screen bg-[#FDF6F0] py-8 px-4">

      <div className="max-w-md mx-auto">


        {/* ================= HEADER ================= */}

        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-[#5C3A21]">
            Discover
          </h1>

          <p className="text-[#8B5E3C] mt-1">
            Find your next friend
          </p>

        </div>


        {/* ================= PROFILE CARD ================= */}

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-[#F0E0D0]">


          {/* PROFILE IMAGE */}

          <div className="h-72 bg-gradient-to-br from-[#E07A3D] to-[#C45C26] flex items-center justify-center">

            {currentUser.profilePic ? (

              <img
                src={currentUser.profilePic}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />

            ) : (

              <div className="w-32 h-32 rounded-full bg-white/30 flex items-center justify-center text-white text-5xl font-bold">

                {currentUser.name
                  ?.charAt(0)
                  .toUpperCase()}

              </div>

            )}

          </div>


          {/* ================= PROFILE INFORMATION ================= */}

          <div className="p-6">


            {/* NAME */}

            <h2 className="text-2xl font-bold text-[#5C3A21]">

              {currentUser.name}

            </h2>


            {/* DEPARTMENT + SEMESTER */}

            <p className="text-[#8B5E3C] mt-1">

              {currentUser.department &&
                `${currentUser.department}`}

              {currentUser.semester &&
                ` • ${currentUser.semester} Semester`}

            </p>


            {/* UNIVERSITY */}

            {currentUser.university && (

              <p className="text-sm text-[#A67C52] mt-1">

                {currentUser.university}

              </p>

            )}


            {/* BIO */}

            {currentUser.bio && (

              <p className="text-[#5C3A21] mt-4 text-sm leading-relaxed">

                {currentUser.bio}

              </p>

            )}


            {/* ================= INTERESTS ================= */}

            {currentUser.interests?.length > 0 && (

              <div className="mt-4">

                <p className="text-xs font-semibold text-[#8B5E3C] mb-2">

                  INTERESTS

                </p>


                <div className="flex flex-wrap gap-2">

                  {currentUser.interests.map(
                    (interest, i) => (

                      <span
                        key={i}
                        className="px-3 py-1 bg-[#FDF0E6] text-[#C45C26] text-xs rounded-full font-medium"
                      >

                        {interest}

                      </span>

                    )
                  )}

                </div>

              </div>

            )}


            {/* ================= SKILLS ================= */}

            {currentUser.skills?.length > 0 && (

              <div className="mt-4">

                <p className="text-xs font-semibold text-[#8B5E3C] mb-2">

                  SKILLS

                </p>


                <div className="flex flex-wrap gap-2">

                  {currentUser.skills.map(
                    (skill, i) => (

                      <span
                        key={i}
                        className="px-3 py-1 bg-[#FFF5EB] text-[#A67C52] text-xs rounded-full"
                      >

                        {skill}

                      </span>

                    )
                  )}

                </div>

              </div>

            )}


            {/* ================= FRIENDSHIP GOALS ================= */}

            {currentUser.friendshipGoals?.length > 0 && (

              <div className="mt-4">

                <p className="text-xs font-semibold text-[#8B5E3C] mb-2">

                  LOOKING FOR

                </p>


                <div className="flex flex-wrap gap-2">

                  {currentUser.friendshipGoals.map(
                    (goal, i) => (

                      <span
                        key={i}
                        className="px-3 py-1 bg-[#E07A3D] text-white text-xs rounded-full"
                      >

                        {goal}

                      </span>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </div>


        {/* ================= ACTION BUTTONS ================= */}

        <div className="flex justify-center gap-8 mt-8">


          {/* SKIP */}

          <button
            onClick={() =>
              handleSwipe(false)
            }
            className="w-16 h-16 rounded-full bg-white border-2 border-[#E07A3D] text-[#E07A3D] flex items-center justify-center text-2xl shadow-md hover:bg-[#FFF5EB] transition"
          >

            ✕

          </button>


          {/* LIKE */}

          <button
            onClick={() =>
              handleSwipe(true)
            }
            className="w-16 h-16 rounded-full bg-[#E07A3D] text-white flex items-center justify-center text-2xl shadow-md hover:bg-[#C45C26] transition"
          >

            ♥

          </button>

        </div>

      </div>


      {/* ================= MATCH POPUP ================= */}

      {matchPopup && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">


            <div className="text-5xl mb-4">

              🎉

            </div>


            <h2 className="text-2xl font-bold text-[#5C3A21] mb-2">

              It's a Match!

            </h2>


            <p className="text-[#8B5E3C] mb-6">

              You and{" "}

              <span className="font-semibold">

                {matchPopup.name}

              </span>{" "}

              liked each other.

            </p>


            <button
              onClick={() =>
                setMatchPopup(null)
              }
              className="w-full bg-[#E07A3D] text-white py-3 rounded-xl font-medium hover:bg-[#C45C26] transition"
            >

              Continue Swiping

            </button>

          </div>

        </div>

      )}

    </div>
  );
};


export default Discover;