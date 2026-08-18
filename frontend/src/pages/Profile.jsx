import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

/* =========================================================
   HELPERS
========================================================= */

const getFormDataFromUser = (user) => ({
  name: user?.name || "",
  university: user?.university || "",
  department: user?.department || "",
  semester: user?.semester || "",
  bio: user?.bio || "",
  interests: user?.interests?.join(", ") || "",
  skills: user?.skills?.join(", ") || "",
  friendshipGoals: user?.friendshipGoals?.join(", ") || "",
});

const getProfilePicUrl = (profilePic) => {
  if (!profilePic) return "";

  // Already a complete URL or base64 image
  if (
    profilePic.startsWith("http://") ||
    profilePic.startsWith("https://") ||
    profilePic.startsWith("data:")
  ) {
    return profilePic;
  }

  // Image path returned from backend
  return `http://localhost:5000${
    profilePic.startsWith("/") ? profilePic : `/${profilePic}`
  }`;
};

/* =========================================================
   PROFILE COMPONENT
========================================================= */

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
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  /* =========================================================
     LOAD USER DATA
  ========================================================= */

  useEffect(() => {
    /*
      Do not reset the form while the user is editing.

      This is important because uploading a picture updates
      the AuthContext user. Without this check, the form would
      reset and unsaved text changes could disappear.
    */
    if (user && !isEditing) {
      setFormData(getFormDataFromUser(user));
    }
  }, [user, isEditing]);

  /* Clean up temporary preview URL */
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /* =========================================================
     IMAGE SELECTION
  ========================================================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    // Optional 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  /* =========================================================
     UPLOAD PROFILE PICTURE
     This button only appears inside EDIT PROFILE.
  ========================================================= */

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please choose a picture first.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setMessage("");

      const imageData = new FormData();

      imageData.append("profilePic", selectedImage);

      const res = await API.post("/users/me/profile-picture", imageData);

      // Update AuthContext so new picture appears everywhere
      updateUser(res.data);

      setSelectedImage(null);
      setImagePreview("");

      setMessage("Profile picture uploaded successfully.");
    } catch (err) {
      console.error("Profile picture upload error:", err);

      setError(
        err.response?.data?.message || "Failed to upload profile picture.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* =========================================================
     EDIT PROFILE
  ========================================================= */

  const handleEdit = () => {
    setFormData(getFormDataFromUser(user));

    setSelectedImage(null);
    setImagePreview("");

    setMessage("");
    setError("");

    setIsEditing(true);
  };

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const handleCancel = () => {
    setFormData(getFormDataFromUser(user));

    setSelectedImage(null);
    setImagePreview("");

    setMessage("");
    setError("");

    setIsEditing(false);
  };

  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      /* -----------------------------------------
         Normal profile fields
      ----------------------------------------- */

      const payload = {
        name: formData.name.trim(),

        university: formData.university.trim(),

        department: formData.department.trim(),

        semester: formData.semester.trim(),

        bio: formData.bio.trim(),

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
      };

      /* -----------------------------------------
         1. Update normal profile information
      ----------------------------------------- */

      const profileRes = await API.put("/users/me", payload);

      let updatedUser = profileRes.data;

      /* -----------------------------------------
         2. If user selected a new picture but did
            not press Upload Picture separately,
            upload it here automatically.
      ----------------------------------------- */

      if (selectedImage) {
        try {
          const imageData = new FormData();

          imageData.append("profilePic", selectedImage);

          const imageRes = await API.post(
            "/users/me/profile-picture",
            imageData,
          );

          updatedUser = imageRes.data;
        } catch (imageError) {
          /*
            Profile text was already saved,
            so keep that updated information.
          */
          updateUser(profileRes.data);

          console.error("Profile picture upload error:", imageError);

          setError(
            imageError.response?.data?.message ||
              "Profile information was updated, but the picture could not be uploaded.",
          );

          return;
        }
      }

      /* -----------------------------------------
         3. Update global user state
      ----------------------------------------- */

      updateUser(updatedUser);

      /* -----------------------------------------
         4. Clear temporary picture state
      ----------------------------------------- */

      setSelectedImage(null);
      setImagePreview("");

      /* -----------------------------------------
         5. Leave edit screen
      ----------------------------------------- */

      setIsEditing(false);

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Update profile error:", err);

      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6FFEA] flex items-center justify-center">
        <p className="text-gray-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6FFEA] py-10 px-4">
      {/* Background decorations */}

      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-[#FA855A] opacity-20 blur-3xl rounded-full" />

      <div className="pointer-events-none absolute top-40 -right-32 w-80 h-80 bg-[#62C4DA] opacity-20 blur-3xl rounded-full" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 bg-[#FFDE96] opacity-20 blur-3xl rounded-full" />

      {/* =====================================================
          MAIN PROFILE VIEW
      ====================================================== */}

      {!isEditing && (
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Success Message */}

          {message && (
            <div className="mb-5 bg-white border border-[#62C4DA] text-gray-800 font-medium px-5 py-3 rounded-2xl shadow-sm">
              {message}
            </div>
          )}

          {/* Error Message */}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 font-medium px-5 py-3 rounded-2xl">
              {error}
            </div>
          )}

          {/* Main Profile Card */}

          <div className="bg-white rounded-[34px] overflow-hidden shadow-xl border border-gray-100">
            {/* ===============================
                Header
            =============================== */}

            <div className="relative bg-[#FA855A] px-7 pt-8 pb-28">
              <div className="absolute top-7 right-40 w-8 h-8 bg-[#FFDE96] rotate-12 rounded-lg" />

              <div className="absolute bottom-6 left-8 w-16 h-3 bg-[#C93638] rotate-[-4deg] rounded-full opacity-80" />

              <p className="text-[#7E2728] font-black uppercase tracking-[0.24em] text-xs">
                FriendLoop Profile
              </p>

              <button
                type="button"
                onClick={handleEdit}
                className="
                  absolute
                  top-6
                  right-6
                  bg-white
                  text-black
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

            {/* ===============================
                PROFILE PICTURE

                DISPLAY ONLY.
                NO choose file here.
                NO upload button here.
            =============================== */}

            <div className="px-7">
              <div className="-mt-16 relative z-10">
                {user.profilePic ? (
                  <img
                    src={getProfilePicUrl(user.profilePic)}
                    alt={user.name}
                    className="
                      w-32
                      h-32
                      rounded-[28px]
                      object-cover
                      border-4
                      border-white
                      shadow-lg
                    "
                  />
                ) : (
                  <div
                    className="
                      w-32
                      h-32
                      rounded-[28px]
                      bg-[#62C4DA]
                      border-4
                      border-white
                      shadow-lg
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <span className="text-white text-4xl font-black">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ===============================
                Profile Content
            =============================== */}

            <div className="px-7 pb-8">
              {/* Name + Email */}

              <div className="mt-5">
                <h1 className="text-5xl font-black !text-black leading-none">
                  {user.name}
                </h1>

                <p className="mt-3 text-gray-500 font-medium">{user.email}</p>
              </div>

              {/* University Information */}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* University */}

                <div className="bg-[#FFDE96] rounded-[22px] px-5 py-4 rotate-[-1deg]">
                  <p className="text-xs uppercase tracking-widest font-bold text-[#C93638]">
                    University
                  </p>

                  <p className="mt-1 font-black !text-black text-lg">
                    {user.university || "Not added"}
                  </p>
                </div>

                {/* Department */}

                <div className="bg-[#62C4DA] rounded-[22px] px-5 py-4 rotate-[1deg]">
                  <p className="text-xs uppercase tracking-widest font-bold text-white">
                    Department
                  </p>

                  <p className="mt-1 font-black text-white text-lg">
                    {user.department || "Not added"}
                  </p>
                </div>

                {/* Semester */}

                <div className="bg-[#FA855A] rounded-[22px] px-5 py-4 rotate-[-1deg]">
                  <p className="text-xs uppercase tracking-widest font-bold text-[#C93638]">
                    Semester
                  </p>

                  <p className="mt-1 font-black text-white text-lg">
                    {user.semester || "Not added"}
                  </p>
                </div>
              </div>

              {/* ===============================
                  About Me
              =============================== */}

              <div className="mt-8 bg-[#F6FFEA]/60 border border-gray-200 rounded-[26px] p-6">
                <p className="uppercase tracking-[0.2em] text-xs font-black text-[#FA855A] mb-3">
                  About Me
                </p>

                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  {user.bio ||
                    "Still working on something interesting to say here."}
                </p>
              </div>

              {/* ===============================
                  Interests
              =============================== */}

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Interests</h2>

                  <div className="h-[3px] flex-1 bg-[#FFDE96] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.interests?.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span
                        key={`${interest}-${index}`}
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

              {/* ===============================
                  Skills
              =============================== */}

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Skills</h2>

                  <div className="h-[3px] flex-1 bg-[#62C4DA] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.skills?.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="
                          px-5
                          py-2
                          rounded-full
                          bg-[#F3FBFD]
                          border
                          border-[#62C4DA]
                          !text-black
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

              {/* ===============================
                  Friendship Goals
              =============================== */}

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Here For</h2>

                  <div className="h-[3px] flex-1 bg-[#FA855A] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.friendshipGoals?.length > 0 ? (
                    user.friendshipGoals.map((goal, index) => (
                      <span
                        key={`${goal}-${index}`}
                        className="
                          px-5
                          py-2
                          rounded-full
                          bg-[#FFF6F2]
                          border
                          border-[#FA855A]
                          !text-black
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

              {/* Bottom Edit Button */}

              <button
                type="button"
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

      {/* =====================================================
          EDIT PROFILE
      ====================================================== */}

      {isEditing && (
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Heading */}

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

          {/* Success Message */}

          {message && (
            <div className="bg-[#F3FBFD] border border-[#62C4DA] text-gray-800 p-4 rounded-2xl mb-5 font-medium">
              {message}
            </div>
          )}

          {/* Error Message */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-5 font-medium">
              {error}
            </div>
          )}

          {/* =================================================
              Edit Form
          ================================================= */}

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
            {/* ===============================================
                PROFILE PICTURE UPLOAD

                THIS EXISTS ONLY INSIDE EDIT PROFILE.
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-3">
                Upload Picture
              </label>

              <div
                className="
                  bg-[#F6FFEA]/60
                  border
                  border-gray-200
                  rounded-[24px]
                  p-5
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  {/* Image Preview */}

                  <div className="shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="New profile preview"
                        className="
                          w-28
                          h-28
                          rounded-[24px]
                          object-cover
                          border-4
                          border-white
                          shadow-md
                        "
                      />
                    ) : user.profilePic ? (
                      <img
                        src={getProfilePicUrl(user.profilePic)}
                        alt="Current profile"
                        className="
                          w-28
                          h-28
                          rounded-[24px]
                          object-cover
                          border-4
                          border-white
                          shadow-md
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-28
                          h-28
                          rounded-[24px]
                          bg-[#62C4DA]
                          flex
                          items-center
                          justify-center
                          border-4
                          border-white
                          shadow-md
                        "
                      >
                        <span className="text-white text-4xl font-black">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Choose File + Upload */}

                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="
                        block
                        w-full
                        text-sm
                        text-gray-600

                        file:mr-4
                        file:py-2
                        file:px-5
                        file:rounded-full
                        file:border-0
                        file:bg-[#FFDE96]
                        file:text-black
                        file:font-bold

                        hover:file:bg-[#F7CF78]
                        cursor-pointer
                      "
                    />

                    <p className="text-xs text-gray-400 mt-2">
                      JPG, PNG or WEBP. Maximum 5 MB.
                    </p>

                    {selectedImage && (
                      <>
                        <p className="text-sm !text-black font-semibold mt-3">
                          Selected: {selectedImage.name}
                        </p>

                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          className="
                            mt-3
                            bg-[#FA855A]
                            text-white
                            px-5
                            py-2.5
                            rounded-xl
                            font-bold
                            hover:bg-[#C93638]
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {uploadingImage ? "Uploading..." : "Upload Picture"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===============================================
                Full Name
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-2">
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
                  !text-black
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* ===============================================
                University + Department
            =============================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* University */}

              <div>
                <label className="block text-sm font-bold !text-black mb-2">
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
                    !text-black
                    placeholder:text-gray-400
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
                <label className="block text-sm font-bold !text-black mb-2">
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
                    !text-black
                    placeholder:text-gray-400
                    outline-none
                    focus:border-[#FA855A]
                    focus:ring-2
                    focus:ring-[#FA855A]/15
                    transition
                  "
                />
              </div>
            </div>

            {/* ===============================================
                Semester
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-2">
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
                  !text-black
                  placeholder:text-gray-400
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* ===============================================
                Bio
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-2">
                About Me
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell people a little about yourself..."
                className="
                  w-full
                  bg-[#F6FFEA]/50
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  !text-black
                  placeholder:text-gray-400
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  resize-none
                  transition
                "
              />
            </div>

            {/* ===============================================
                Interests
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-1">
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
                  !text-black
                  placeholder:text-gray-400
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* ===============================================
                Skills
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-1">
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
                  !text-black
                  placeholder:text-gray-400
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* ===============================================
                Friendship Goals
            =============================================== */}

            <div>
              <label className="block text-sm font-bold !text-black mb-1">
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
                  !text-black
                  placeholder:text-gray-400
                  outline-none
                  focus:border-[#FA855A]
                  focus:ring-2
                  focus:ring-[#FA855A]/15
                  transition
                "
              />
            </div>

            {/* ===============================================
                Buttons
            =============================================== */}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {/* Cancel */}

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="
                  sm:w-1/3
                  bg-gray-100
                  !text-black
                  py-3
                  rounded-2xl
                  font-bold
                  hover:bg-gray-200
                  transition
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              {/* Update Profile */}

              <button
                type="submit"
                disabled={loading || uploadingImage}
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
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
