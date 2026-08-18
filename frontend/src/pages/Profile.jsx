import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    department: "",
    semester: "",
    bio: "",
    interests: "",
    skills: "",
    friendshipGoals: "",
    profilePic: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fill form with current user information
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        university: user.university || "",
        department: user.department || "",
        semester: user.semester || "",
        bio: user.bio || "",
        interests: user.interests?.join(", ") || "",
        skills: user.skills?.join(", ") || "",
        friendshipGoals: user.friendshipGoals?.join(", ") || "",
        profilePic: user.profilePic || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form back to saved user information
  const resetForm = () => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      university: user.university || "",
      department: user.department || "",
      semester: user.semester || "",
      bio: user.bio || "",
      interests: user.interests?.join(", ") || "",
      skills: user.skills?.join(", ") || "",
      friendshipGoals: user.friendshipGoals?.join(", ") || "",
      profilePic: user.profilePic || "",
    });
  };

  const handleEdit = () => {
    resetForm();
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setError("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: formData.name,
        university: formData.university,
        department: formData.department,
        semester: formData.semester,
        bio: formData.bio,

        interests: formData.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        skills: formData.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        friendshipGoals: formData.friendshipGoals
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        profilePic: formData.profilePic,
      };

      const res = await API.put("/users/me", payload);

      updateUser(res.data);

      setMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6FFEA] flex items-center justify-center">
        <p className="text-gray-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6FFEA] py-10 px-4">
      {/* Soft background decoration */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-[#FA855A] opacity-20 blur-3xl rounded-full" />

      <div className="pointer-events-none absolute top-40 -right-32 w-80 h-80 bg-[#62C4DA] opacity-20 blur-3xl rounded-full" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 bg-[#FFDE96] opacity-20 blur-3xl rounded-full" />

      {/* ================================================== */}
      {/* PROFILE VIEW */}
      {/* ================================================== */}

      {!isEditing && (
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Success Message */}
          {message && (
            <div className="mb-5 bg-white border border-[#62C4DA] text-gray-800 font-medium px-5 py-3 rounded-2xl shadow-sm">
              {message}
            </div>
          )}

          {/* Main Profile Card */}
          <div className="bg-white rounded-[34px] overflow-hidden shadow-xl border border-gray-100">
            {/* Top Header */}
            <div className="relative bg-[#FA855A] px-7 pt-8 pb-28">
              {/* Small decorative shapes */}
              <div className="absolute top-7 right-40 w-8 h-8 bg-[#FFDE96] rotate-12 rounded-lg" />

              <div className="absolute bottom-6 left-8 w-16 h-3 bg-[#C93638] rotate-[-4deg] rounded-full opacity-80" />

              <p className="text-[#7E2728] font-black uppercase tracking-[0.24em] text-xs">
                FriendLoop Profile
              </p>

              <button
                onClick={handleEdit}
                className="
                  absolute
                  top-6
                  right-6
                  bg-white
                  text-gray-900
                  px-5
                  py-2
                  rounded-full
                  font-bold
                  shadow-sm
                  hover:-translate-y-0.5
                  transition
                  duration-200
                "
              >
                Edit Profile
              </button>
            </div>

            {/* Profile Picture */}
            <div className="relative px-7">
              <div className="-mt-20 relative w-40 h-40">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="
                      w-40
                      h-40
                      rounded-[30px]
                      object-cover
                      border-[6px]
                      border-white
                      shadow-lg
                      rotate-[-2deg]
                    "
                  />
                ) : (
                  <div
                    className="
                      w-40
                      h-40
                      rounded-[30px]
                      bg-[#62C4DA]
                      border-[6px]
                      border-white
                      shadow-lg
                      rotate-[-2deg]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <span className="text-white text-6xl font-black">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-7 pb-8">
              {/* Name + Email */}
              <div className="mt-5">
                <h1 className="text-5xl font-black !text-black leading-none">
                  {user.name}
                </h1>

                <p className="mt-3 text-gray-500 font-medium">{user.email}</p>
              </div>

              {/* University info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#FFDE96] rounded-[22px] px-5 py-4 rotate-[-1deg]">
                  <p className="text-xs uppercase tracking-widest font-bold text-[#C93638]">
                    University
                  </p>

                  <p className="mt-1 font-black text-gray-800 text-lg">
                    {user.university || "Not added"}
                  </p>
                </div>

                <div className="bg-[#62C4DA] rounded-[22px] px-5 py-4 rotate-[1deg]">
                  <p className="text-xs uppercase tracking-widest font-bold text-white">
                    Department
                  </p>

                  <p className="mt-1 font-black text-white text-lg">
                    {user.department || "Not added"}
                  </p>
                </div>

                <div className="bg-[#FA855A] rounded-[22px] px-5 py-4 rotate-[-1deg]">
                  <p className="text-xs uppercase tracking-widest font-bold text-[#C93638]">
                    Semester
                  </p>

                  <p className="mt-1 font-black text-white text-lg">
                    {user.semester || "Not added"}
                  </p>
                </div>
              </div>

              {/* About Me */}
              <div className="mt-8 bg-[#F6FFEA]/60 border border-gray-200 rounded-[26px] p-6">
                <p className="uppercase tracking-[0.2em] text-xs font-black text-[#FA855A] mb-3">
                  About Me
                </p>

                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  {user.bio ||
                    "Still working on something interesting to say here."}
                </p>
              </div>

              {/* Interests */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Interests</h2>

                  <div className="h-[3px] flex-1 bg-[#FFDE96] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.interests?.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="
                          px-5
                          py-2
                          rounded-full
                          bg-[#FFDE96]/50
                          border
                          border-[#FFDE96]
                          !text-black
                          font-semibold
                          text-sm
                        "
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">No interests added yet.</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Skills</h2>

                  <div className="h-[3px] flex-1 bg-[#62C4DA] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.skills?.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="
                          px-5
                          py-2
                          rounded-full
                          bg-[#F3FBFD]
                          border
                          border-[#62C4DA]
                          text-gray-800
                          font-semibold
                          text-sm
                        "
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Friendship Goals */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Here For</h2>

                  <div className="h-[3px] flex-1 bg-[#FA855A] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.friendshipGoals?.length > 0 ? (
                    user.friendshipGoals.map((goal, index) => (
                      <span
                        key={index}
                        className="
                          px-5
                          py-2
                          rounded-full
                          bg-[#FFF6F2]
                          border
                          border-[#FA855A]
                          text-gray-800
                          font-semibold
                          text-sm
                        "
                      >
                        {goal}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No friendship goals added yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={handleEdit}
                className="
                  mt-10
                  w-full
                  bg-[#C93638]
                  text-white
                  py-4
                  rounded-[20px]
                  font-bold
                  text-lg
                  hover:bg-[#B52F31]
                  hover:-translate-y-0.5
                  transition
                  duration-200
                  shadow-md
                "
              >
                Edit My Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* EDIT PROFILE */}
      {/* ================================================== */}

      {isEditing && (
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Edit Heading */}
          <div className="mb-7">
            <p className="uppercase text-[#FA855A] tracking-[0.24em] text-xs font-bold">
              Your profile
            </p>

            <h1 className="text-4xl md:text-5xl font-black !text-black mt-2">
              Edit Profile
            </h1>

            <p className="text-gray-500 mt-2">
              Update what people see on your FriendLoop profile.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-5 font-medium">
              {error}
            </div>
          )}

          {/* Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="
              bg-white
              border
              border-gray-100
              p-7
              md:p-8
              rounded-[32px]
              shadow-xl
              space-y-6
            "
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* University + Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* University */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  University
                </label>

                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. IUT"
                  className="
                    w-full
                    bg-[#F6FFEA]/50
                    border
                    border-gray-200
                    rounded-2xl
                    px-4
                    py-3
                    text-gray-800
                    outline-none
                    focus:border-[#FA855A]
                    focus:ring-2
                    focus:ring-[#FA855A]/15
                    transition
                  "
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. SWE"
                  className="
                    w-full
                    bg-[#F6FFEA]/50
                    border
                    border-gray-200
                    rounded-2xl
                    px-4
                    py-3
                    text-gray-800
                    outline-none
                    focus:border-[#FA855A]
                    focus:ring-2
                    focus:ring-[#FA855A]/15
                    transition
                  "
                />
              </div>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Semester
              </label>

              <input
                type="text"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="e.g. 3rd"
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                About Me
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell people a little about yourself..."
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  resize-none
                  transition
                "
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Interests
              </label>

              <p className="text-xs text-gray-400 mb-2">
                Separate each interest with a comma
              </p>

              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="music, films, coding, books"
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Skills
              </label>

              <p className="text-xs text-gray-400 mb-2">
                Separate each skill with a comma
              </p>

              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python"
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* Friendship Goals */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Here For
              </label>

              <p className="text-xs text-gray-400 mb-2">
                Separate each goal with a comma
              </p>

              <input
                type="text"
                name="friendshipGoals"
                value={formData.friendshipGoals}
                onChange={handleChange}
                placeholder="study partner, project partner, new friends"
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Profile Picture
              </label>

              <input
                type="text"
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
                placeholder="Paste image URL"
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  text-gray-800
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />

              {/* Image Preview */}
              {formData.profilePic && (
                <img
                  src={formData.profilePic}
                  alt="Preview"
                  className="
                    mt-5
                    w-28
                    h-28
                    rounded-[24px]
                    object-cover
                    border-4
                    border-white
                    shadow-md
                    rotate-[-2deg]
                  "
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                className="
                  sm:w-1/3
                  bg-gray-100
                  text-gray-700
                  py-3
                  rounded-2xl
                  font-bold
                  hover:bg-gray-200
                  transition
                "
              >
                Cancel
              </button>

              {/* Save */}
              <button
                type="submit"
                disabled={loading}
                className="
                  sm:w-2/3
                  bg-[#C93638]
                  text-white
                  py-3
                  rounded-2xl
                  font-bold
                  hover:bg-[#FA855A]
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
