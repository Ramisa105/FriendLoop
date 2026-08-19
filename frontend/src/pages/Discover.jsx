import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

// Check if two arrays share at least one item
const arraysHaveCommonItem = (first = [], second = []) => {
  const normalizedFirst = first
    .map(normalize)
    .filter(Boolean);

  return second.some((item) =>
    normalizedFirst.includes(normalize(item))
  );
};

// Check if an individual item exists in both arrays
const getCommonItems = (first = [], second = []) => {
  const normalizedFirst = first.map(normalize);

  return second.filter((item) =>
    normalizedFirst.includes(normalize(item))
  );
};

// ======================================================
// DISCOVER COMPONENT
// ======================================================

const Discover = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [myProfile, setMyProfile] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  const [matchPopup, setMatchPopup] = useState(null);

  // ======================================================
  // DISCOVERY METHOD
  // ======================================================

  // interest | skill | department | institution | name
  const [discoverBy, setDiscoverBy] =
    useState("interest");

  const [nameSearch, setNameSearch] =
    useState("");

  // ======================================================
  // FETCH USERS
  // ======================================================

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [meRes, suggestionsRes] =
          await Promise.all([
            API.get("/users/me"),
            API.get("/users/suggestions"),
          ]);

        const myProfileData = meRes.data;

        const allSuggestions =
          suggestionsRes.data;

        setMyProfile(myProfileData);

        // Admins should never appear
        const availableUsers =
          allSuggestions.filter(
            (otherUser) =>
              !otherUser.isAdmin
          );

        setSuggestions(availableUsers);
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

  // ======================================================
  // FILTER BASED ON DISCOVERY METHOD
  // ======================================================

  const filteredSuggestions = useMemo(() => {
    if (!myProfile) {
      return [];
    }

    return suggestions.filter((user) => {
      // ==============================================
      // INTEREST
      // ==============================================

      if (discoverBy === "interest") {
        return arraysHaveCommonItem(
          myProfile.interests || [],
          user.interests || []
        );
      }

      // ==============================================
      // SKILL
      // ==============================================

      if (discoverBy === "skill") {
        return arraysHaveCommonItem(
          myProfile.skills || [],
          user.skills || []
        );
      }

      // ==============================================
      // DEPARTMENT
      // ==============================================

      if (discoverBy === "department") {
        if (
          !myProfile.department ||
          !user.department
        ) {
          return false;
        }

        return (
          normalize(myProfile.department) ===
          normalize(user.department)
        );
      }

      // ==============================================
      // INSTITUTION
      // ==============================================

      if (discoverBy === "institution") {
        if (
          !myProfile.university ||
          !user.university
        ) {
          return false;
        }

        return (
          normalize(myProfile.university) ===
          normalize(user.university)
        );
      }

      // ==============================================
      // NAME
      // ==============================================

      if (discoverBy === "name") {
        const search =
          normalize(nameSearch);

        if (!search) {
          return false;
        }

        return normalize(user.name).includes(
          search
        );
      }

      return false;
    });
  }, [
    suggestions,
    myProfile,
    discoverBy,
    nameSearch,
  ]);

  // ======================================================
  // CURRENT USER
  // ======================================================

  const currentUser =
    filteredSuggestions[currentIndex];

  // ======================================================
  // CHANGE DISCOVERY METHOD
  // ======================================================

  const handleDiscoverMethodChange = (
    method
  ) => {
    setDiscoverBy(method);

    // Start from first result
    setCurrentIndex(0);

    if (method !== "name") {
      setNameSearch("");
    }
  };

  // ======================================================
  // FIND SHARED INTERESTS
  // ======================================================

  const commonInterests = currentUser
    ? getCommonItems(
        myProfile?.interests || [],
        currentUser.interests || []
      )
    : [];

  // ======================================================
  // FIND SHARED SKILLS
  // ======================================================

  const commonSkills = currentUser
    ? getCommonItems(
        myProfile?.skills || [],
        currentUser.skills || []
      )
    : [];

  // ======================================================
  // LIKE / SKIP
  // ======================================================

  const handleSwipe = async (liked) => {
    if (!currentUser) {
      return;
    }

    if (liked) {
      try {
        const res = await API.post(
          `/matches/like/${currentUser._id}`
        );

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

    setCurrentIndex(
      (previousIndex) =>
        previousIndex + 1
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
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-[#FDF6F0] py-8 px-4">
      <div className="max-w-md mx-auto">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-[#5C3A21]">
            Discover
          </h1>

          <p className="text-[#8B5E3C] mt-1">
            Find your next friend
          </p>

        </div>

        {/* ==========================================
            DISCOVER BY
        ========================================== */}

        <div className="mb-6">

          <p className="text-sm font-semibold text-[#5C3A21] mb-3">
            Discover friends by
          </p>

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              gap-2
              bg-white
              p-2
              rounded-2xl
              border
              border-[#F0E0D0]
              shadow-sm
            "
          >

            {/* INTEREST */}

            <button
              type="button"
              onClick={() =>
                handleDiscoverMethodChange(
                  "interest"
                )
              }
              className={`
                py-3
                px-2
                rounded-xl
                text-sm
                font-semibold
                transition
                ${
                  discoverBy === "interest"
                    ? "bg-[#E07A3D] text-white shadow-sm"
                    : "text-[#8B5E3C] hover:bg-[#FFF5EB]"
                }
              `}
            >
              <span className="block text-lg">
                ❤️
              </span>

              Interest
            </button>

            {/* SKILL */}

            <button
              type="button"
              onClick={() =>
                handleDiscoverMethodChange(
                  "skill"
                )
              }
              className={`
                py-3
                px-2
                rounded-xl
                text-sm
                font-semibold
                transition
                ${
                  discoverBy === "skill"
                    ? "bg-[#E07A3D] text-white shadow-sm"
                    : "text-[#8B5E3C] hover:bg-[#FFF5EB]"
                }
              `}
            >
              <span className="block text-lg">
                🛠️
              </span>

              Skill
            </button>

            {/* DEPARTMENT */}

            <button
              type="button"
              onClick={() =>
                handleDiscoverMethodChange(
                  "department"
                )
              }
              className={`
                py-3
                px-2
                rounded-xl
                text-sm
                font-semibold
                transition
                ${
                  discoverBy ===
                  "department"
                    ? "bg-[#E07A3D] text-white shadow-sm"
                    : "text-[#8B5E3C] hover:bg-[#FFF5EB]"
                }
              `}
            >
              <span className="block text-lg">
                🏫
              </span>

              Department
            </button>

            {/* INSTITUTION */}

            <button
              type="button"
              onClick={() =>
                handleDiscoverMethodChange(
                  "institution"
                )
              }
              className={`
                py-3
                px-2
                rounded-xl
                text-sm
                font-semibold
                transition
                ${
                  discoverBy ===
                  "institution"
                    ? "bg-[#E07A3D] text-white shadow-sm"
                    : "text-[#8B5E3C] hover:bg-[#FFF5EB]"
                }
              `}
            >
              <span className="block text-lg">
                🎓
              </span>

              Institution
            </button>

            {/* NAME */}

            <button
              type="button"
              onClick={() =>
                handleDiscoverMethodChange(
                  "name"
                )
              }
              className={`
                py-3
                px-2
                rounded-xl
                text-sm
                font-semibold
                transition
                ${
                  discoverBy === "name"
                    ? "bg-[#E07A3D] text-white shadow-sm"
                    : "text-[#8B5E3C] hover:bg-[#FFF5EB]"
                }
              `}
            >
              <span className="block text-lg">
                🔍
              </span>

              Name
            </button>

          </div>

          {/* ==========================================
              INTEREST MODE INFO
          ========================================== */}

          {discoverBy === "interest" && (

            <div
              className="
                mt-4
                bg-[#FFF5EB]
                border
                border-[#F0E0D0]
                rounded-2xl
                p-4
              "
            >

              <p className="text-xs font-bold text-[#C45C26]">
                ❤️ YOUR INTERESTS
              </p>

              <p className="text-xs text-[#8B5E3C] mt-1 mb-3">
                Showing people who share at
                least one interest with you.
              </p>

              {myProfile?.interests?.length >
              0 ? (

                <div className="flex flex-wrap gap-2">

                  {myProfile.interests.map(
                    (interest, index) => (

                      <span
                        key={`${interest}-${index}`}
                        className="
                          bg-white
                          border
                          border-[#F0E0D0]
                          rounded-full
                          px-3
                          py-1.5
                          text-xs
                          text-[#C45C26]
                          font-medium
                        "
                      >
                        {interest}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p className="text-sm text-[#8B5E3C]">
                  Add interests to your
                  profile first.
                </p>

              )}

            </div>

          )}

          {/* ==========================================
              SKILL MODE INFO
          ========================================== */}

          {discoverBy === "skill" && (

            <div
              className="
                mt-4
                bg-[#FFF5EB]
                border
                border-[#F0E0D0]
                rounded-2xl
                p-4
              "
            >

              <p className="text-xs font-bold text-[#C45C26]">
                🛠️ YOUR SKILLS
              </p>

              <p className="text-xs text-[#8B5E3C] mt-1 mb-3">
                Showing people who share at
                least one skill with you.
              </p>

              {myProfile?.skills?.length >
              0 ? (

                <div className="flex flex-wrap gap-2">

                  {myProfile.skills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="
                          bg-white
                          border
                          border-[#F0E0D0]
                          rounded-full
                          px-3
                          py-1.5
                          text-xs
                          text-[#C45C26]
                          font-medium
                        "
                      >
                        {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p className="text-sm text-[#8B5E3C]">
                  Add skills to your profile
                  first.
                </p>

              )}

            </div>

          )}

          {/* ==========================================
              DEPARTMENT MODE
          ========================================== */}

          {discoverBy === "department" && (

            <div
              className="
                mt-4
                bg-[#FFF5EB]
                border
                border-[#F0E0D0]
                rounded-2xl
                p-4
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-[#E07A3D]
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  🏫
                </div>

                <div>

                  <p className="text-xs font-bold text-[#C45C26]">
                    YOUR DEPARTMENT
                  </p>

                  <p className="font-semibold text-[#5C3A21] mt-1">
                    {myProfile?.department ||
                      "No department added"}
                  </p>

                </div>

              </div>

              <p className="text-xs text-[#8B5E3C] mt-3">
                Showing students from your
                department.
              </p>

            </div>

          )}

          {/* ==========================================
              INSTITUTION MODE
          ========================================== */}

          {discoverBy === "institution" && (

            <div
              className="
                mt-4
                bg-[#FFF5EB]
                border
                border-[#F0E0D0]
                rounded-2xl
                p-4
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-[#E07A3D]
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  🎓
                </div>

                <div>

                  <p className="text-xs font-bold text-[#C45C26]">
                    YOUR INSTITUTION
                  </p>

                  <p className="font-semibold text-[#5C3A21] mt-1">
                    {myProfile?.university ||
                      "No institution added"}
                  </p>

                </div>

              </div>

              <p className="text-xs text-[#8B5E3C] mt-3">
                Showing students from the same
                institution as you.
              </p>

            </div>

          )}

          {/* ==========================================
              NAME MODE
          ========================================== */}

          {discoverBy === "name" && (

            <div className="mt-4">

              <div className="relative">

                <span
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                  "
                >
                  🔍
                </span>

                <input
                  type="text"
                  value={nameSearch}
                  onChange={(e) => {
                    setNameSearch(
                      e.target.value
                    );

                    setCurrentIndex(0);
                  }}
                  placeholder="Search student by name..."
                  className="
                    w-full
                    bg-white
                    border
                    border-[#F0E0D0]
                    rounded-2xl
                    py-3.5
                    pl-12
                    pr-12
                    text-[#5C3A21]
                    placeholder-[#B79778]
                    shadow-sm
                    outline-none
                    focus:border-[#E07A3D]
                    focus:ring-2
                    focus:ring-[#E07A3D]/20
                  "
                />

                {nameSearch && (

                  <button
                    type="button"
                    onClick={() => {
                      setNameSearch("");
                      setCurrentIndex(0);
                    }}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#A67C52]
                    "
                  >
                    ✕
                  </button>

                )}

              </div>

            </div>

          )}

        </div>

        {/* ==========================================
            RESULTS COUNT
        ========================================== */}

        {currentUser && (

          <div
            className="
              flex
              justify-between
              items-center
              mb-3
              px-1
            "
          >

            <p className="text-xs text-[#8B5E3C]">

              {discoverBy ===
                "interest" &&
                "Similar interests"}

              {discoverBy === "skill" &&
                "Similar skills"}

              {discoverBy ===
                "department" &&
                "Same department"}

              {discoverBy ===
                "institution" &&
                "Same institution"}

              {discoverBy === "name" &&
                `Search: "${nameSearch}"`}

            </p>

            <span
              className="
                text-xs
                font-semibold
                text-[#C45C26]
                bg-[#FDF0E6]
                px-3
                py-1
                rounded-full
              "
            >
              {filteredSuggestions.length}{" "}
              found
            </span>

          </div>

        )}

        {/* ==========================================
            NO RESULTS
        ========================================== */}

        {!currentUser ? (

          <div
            className="
              bg-white
              border
              border-[#F0E0D0]
              rounded-3xl
              shadow-sm
              text-center
              px-6
              py-12
            "
          >

            <div className="text-5xl mb-4">

              {discoverBy === "interest" &&
                "❤️"}

              {discoverBy === "skill" &&
                "🛠️"}

              {discoverBy ===
                "department" && "🏫"}

              {discoverBy ===
                "institution" && "🎓"}

              {discoverBy === "name" &&
                "🔍"}

            </div>

            <h2 className="text-xl font-bold text-[#5C3A21]">

              {discoverBy ===
                "interest" &&
                "No matching interests"}

              {discoverBy === "skill" &&
                "No matching skills"}

              {discoverBy ===
                "department" &&
                "No students found"}

              {discoverBy ===
                "institution" &&
                "No students found"}

              {discoverBy === "name" &&
                !nameSearch.trim() &&
                "Search for someone"}

              {discoverBy === "name" &&
                nameSearch.trim() &&
                "No student found"}

            </h2>

            <p className="text-sm text-[#8B5E3C] mt-2">

              {discoverBy ===
                "interest" &&
                "No more students sharing your interests were found."}

              {discoverBy === "skill" &&
                "No more students sharing your skills were found."}

              {discoverBy ===
                "department" &&
                myProfile?.department &&
                `No more students from ${myProfile.department} were found.`}

              {discoverBy ===
                "department" &&
                !myProfile?.department &&
                "Add your department to your profile first."}

              {discoverBy ===
                "institution" &&
                myProfile?.university &&
                `No more students from ${myProfile.university} were found.`}

              {discoverBy ===
                "institution" &&
                !myProfile?.university &&
                "Add your institution to your profile first."}

              {discoverBy === "name" &&
                !nameSearch.trim() &&
                "Enter a student's name above."}

              {discoverBy === "name" &&
                nameSearch.trim() &&
                `No user matching "${nameSearch}" was found.`}

            </p>

          </div>

        ) : (

          <>
            {/* ======================================
                PROFILE CARD
            ====================================== */}

            <div
              className="
                bg-white
                rounded-3xl
                shadow-lg
                overflow-hidden
                border
                border-[#F0E0D0]
              "
            >

              {/* IMAGE */}

              <div
                className="
                  h-72
                  bg-gradient-to-br
                  from-[#E07A3D]
                  to-[#C45C26]
                  flex
                  items-center
                  justify-center
                "
              >

                {currentUser.profilePic ? (

                  <img
                    src={
                      currentUser.profilePic
                    }
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div
                    className="
                      w-32
                      h-32
                      rounded-full
                      bg-white/30
                      flex
                      items-center
                      justify-center
                      text-white
                      text-5xl
                      font-bold
                    "
                  >
                    {currentUser.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                )}

              </div>

              {/* PROFILE DETAILS */}

              <div className="p-6">

                <h2 className="text-2xl font-bold text-[#5C3A21]">
                  {currentUser.name}
                </h2>

                {/* DEPARTMENT */}

                {currentUser.department && (

                  <p className="text-[#8B5E3C] mt-1">
                    {currentUser.department}

                    {currentUser.semester &&
                      ` • ${currentUser.semester} Semester`}
                  </p>

                )}

                {/* UNIVERSITY */}

                {currentUser.university && (

                  <p className="text-sm text-[#A67C52] mt-1">
                    🎓{" "}
                    {currentUser.university}
                  </p>

                )}

                {/* WHY RECOMMENDED */}

                {discoverBy ===
                  "interest" &&
                  commonInterests.length >
                    0 && (

                    <div
                      className="
                        mt-4
                        bg-[#FFF5EB]
                        border
                        border-[#F0E0D0]
                        rounded-xl
                        p-3
                      "
                    >

                      <p className="text-xs font-semibold text-[#C45C26] mb-2">
                        ❤️ Shared{" "}
                        {commonInterests.length ===
                        1
                          ? "interest"
                          : "interests"}
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {commonInterests.map(
                          (
                            interest,
                            index
                          ) => (

                            <span
                              key={`${interest}-${index}`}
                              className="
                                px-2.5
                                py-1
                                bg-[#E07A3D]
                                text-white
                                rounded-full
                                text-xs
                              "
                            >
                              {interest}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {discoverBy ===
                  "skill" &&
                  commonSkills.length > 0 && (

                    <div
                      className="
                        mt-4
                        bg-[#FFF5EB]
                        border
                        border-[#F0E0D0]
                        rounded-xl
                        p-3
                      "
                    >

                      <p className="text-xs font-semibold text-[#C45C26] mb-2">
                        🛠️ Shared{" "}
                        {commonSkills.length ===
                        1
                          ? "skill"
                          : "skills"}
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {commonSkills.map(
                          (skill, index) => (

                            <span
                              key={`${skill}-${index}`}
                              className="
                                px-2.5
                                py-1
                                bg-[#E07A3D]
                                text-white
                                rounded-full
                                text-xs
                              "
                            >
                              {skill}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {discoverBy ===
                  "department" && (

                  <div
                    className="
                      mt-4
                      bg-[#FFF5EB]
                      border
                      border-[#F0E0D0]
                      rounded-xl
                      p-3
                    "
                  >
                    <p className="text-xs font-semibold text-[#C45C26]">
                      🏫 Same department
                    </p>
                  </div>

                )}

                {discoverBy ===
                  "institution" && (

                  <div
                    className="
                      mt-4
                      bg-[#FFF5EB]
                      border
                      border-[#F0E0D0]
                      rounded-xl
                      p-3
                    "
                  >
                    <p className="text-xs font-semibold text-[#C45C26]">
                      🎓 Same institution
                    </p>
                  </div>

                )}

                {/* BIO */}

                {currentUser.bio && (

                  <p className="text-[#5C3A21] mt-4 text-sm leading-relaxed">
                    {currentUser.bio}
                  </p>

                )}

                {/* INTERESTS */}

                {currentUser.interests
                  ?.length > 0 && (

                  <div className="mt-4">

                    <p className="text-xs font-semibold text-[#8B5E3C] mb-2">
                      INTERESTS
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {currentUser.interests.map(
                        (
                          interest,
                          index
                        ) => {
                          const shared =
                            myProfile?.interests?.some(
                              (
                                myInterest
                              ) =>
                                normalize(
                                  myInterest
                                ) ===
                                normalize(
                                  interest
                                )
                            );

                          return (
                            <span
                              key={`${interest}-${index}`}
                              className={`
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-medium
                                ${
                                  shared
                                    ? "bg-[#E07A3D] text-white"
                                    : "bg-[#FDF0E6] text-[#C45C26]"
                                }
                              `}
                            >
                              {interest}

                              {shared &&
                                " ✓"}
                            </span>
                          );
                        }
                      )}

                    </div>

                  </div>

                )}

                {/* SKILLS */}

                {currentUser.skills
                  ?.length > 0 && (

                  <div className="mt-4">

                    <p className="text-xs font-semibold text-[#8B5E3C] mb-2">
                      SKILLS
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {currentUser.skills.map(
                        (
                          skill,
                          index
                        ) => {
                          const shared =
                            myProfile?.skills?.some(
                              (
                                mySkill
                              ) =>
                                normalize(
                                  mySkill
                                ) ===
                                normalize(
                                  skill
                                )
                            );

                          return (
                            <span
                              key={`${skill}-${index}`}
                              className={`
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-medium
                                ${
                                  shared
                                    ? "bg-[#E07A3D] text-white"
                                    : "bg-[#FFF5EB] text-[#A67C52]"
                                }
                              `}
                            >
                              {skill}

                              {shared &&
                                " ✓"}
                            </span>
                          );
                        }
                      )}

                    </div>

                  </div>

                )}

                {/* FRIENDSHIP GOALS */}

                {currentUser
                  .friendshipGoals?.length >
                  0 && (

                  <div className="mt-4">

                    <p className="text-xs font-semibold text-[#8B5E3C] mb-2">
                      LOOKING FOR
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {currentUser.friendshipGoals.map(
                        (goal, index) => (

                          <span
                            key={`${goal}-${index}`}
                            className="
                              px-3
                              py-1
                              bg-[#E07A3D]
                              text-white
                              rounded-full
                              text-xs
                            "
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

            {/* ======================================
                ACTION BUTTONS
            ====================================== */}

            <div className="flex justify-center gap-8 mt-8">

              {/* SKIP */}

              <div className="text-center">

                <button
                  type="button"
                  onClick={() =>
                    handleSwipe(false)
                  }
                  className="
                    w-16
                    h-16
                    rounded-full
                    bg-white
                    border-2
                    border-[#E07A3D]
                    text-[#E07A3D]
                    flex
                    items-center
                    justify-center
                    text-2xl
                    shadow-md
                    hover:bg-[#FFF5EB]
                    hover:scale-105
                    active:scale-95
                    transition
                  "
                >
                  ✕
                </button>

                <p className="text-xs text-[#8B5E3C] mt-2">
                  Skip
                </p>

              </div>

              {/* LIKE */}

              <div className="text-center">

                <button
                  type="button"
                  onClick={() =>
                    handleSwipe(true)
                  }
                  className="
                    w-16
                    h-16
                    rounded-full
                    bg-[#E07A3D]
                    text-white
                    flex
                    items-center
                    justify-center
                    text-2xl
                    shadow-md
                    hover:bg-[#C45C26]
                    hover:scale-105
                    active:scale-95
                    transition
                  "
                >
                  ♥
                </button>

                <p className="text-xs text-[#8B5E3C] mt-2">
                  Connect
                </p>

              </div>

            </div>

          </>

        )}

      </div>

      {/* ==========================================
          MATCH POPUP
      ========================================== */}

      {matchPopup && (

        <div
          className="
            fixed
            inset-0
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            px-4
          "
        >

          <div
            className="
              bg-white
              rounded-3xl
              p-8
              max-w-sm
              w-full
              text-center
              shadow-2xl
            "
          >

            <div className="text-5xl mb-4">
              🎉
            </div>

            <h2 className="text-2xl font-bold text-[#5C3A21] mb-2">
              It's a Match!
            </h2>

            <p className="text-[#8B5E3C] mb-6">

              You and{" "}

              <span className="font-semibold text-[#5C3A21]">
                {matchPopup.name}
              </span>{" "}

              liked each other.

            </p>

            <button
              type="button"
              onClick={() =>
                setMatchPopup(null)
              }
              className="
                w-full
                bg-[#E07A3D]
                text-white
                py-3
                rounded-xl
                font-medium
                hover:bg-[#C45C26]
                transition
              "
            >
              Continue Discovering
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default Discover;