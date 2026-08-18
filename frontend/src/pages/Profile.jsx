import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

// ======================================================
// OPTIONS
// ======================================================

const interestOptions = [
  "Music",
  "Movies",
  "Gaming",
  "Coding",
  "Photography",
  "Traveling",
  "Reading",
  "Sports",
  "Art",
  "Cooking",
  "Anime",
  "Fitness",
  "Technology",
  "Volunteering",
];

const skillOptions = [
  "React",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Node.js",
  "UI/UX Design",
  "Graphic Design",
  "Photography",
  "Video Editing",
  "Public Speaking",
  "Writing",
  "Problem Solving",
  "Research",
];

const friendshipGoalOptions = [
  "New Friends",
  "Study Partner",
  "Project Partner",
  "Gaming Buddy",
  "Travel Buddy",
  "Gym Partner",
  "Campus Friends",
  "Networking",
  "Event Buddy",
];

// ======================================================
// MULTI SELECT DROPDOWN COMPONENT
// ======================================================

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  accent = "#FA855A",
  placeholder,
}) => {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Include any old/custom values that may already exist in MongoDB
  const allOptions = Array.from(new Set([...options, ...selected]));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label}
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          w-full
          bg-[#F6FFEA]/50
          border
          border-gray-200
          rounded-2xl
          px-4
          py-3
          flex
          items-center
          justify-between
          text-left
          hover:border-[#FA855A]
          focus:outline-none
          focus:ring-2
          focus:ring-[#FA855A]/15
          transition
        "
      >
        <span
          className={
            selected.length > 0 ? "text-gray-800 font-medium" : "text-gray-400"
          }
        >
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="
            absolute
            z-50
            left-0
            right-0
            mt-2
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-xl
            p-2
            max-h-64
            overflow-y-auto
          "
        >
          {allOptions.map((option) => {
            const isSelected = selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-xl
                  text-left
                  hover:bg-gray-50
                  transition
                "
              >
                {/* Custom checkbox */}
                <span
                  className="
                    w-5
                    h-5
                    rounded-md
                    border-2
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                  style={{
                    borderColor: isSelected ? accent : "#D1D5DB",

                    backgroundColor: isSelected ? accent : "#FFFFFF",
                  }}
                >
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  )}
                </span>

                <span className="text-gray-800 font-medium">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleOption(item)}
              className="
                flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-gray-50
                border
                border-gray-200
                text-gray-700
                text-sm
                font-semibold
                hover:bg-gray-100
                transition
              "
            >
              <span>{item}</span>

              <span className="text-gray-400 text-base leading-none">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ======================================================
// PROFILE
// ======================================================

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    department: "",
    semester: "",
    bio: "",

    // Now arrays
    interests: [],
    skills: [],
    friendshipGoals: [],
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ====================================================
  // IMAGE STATES
  // ====================================================

  const [selectedImage, setSelectedImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);

  // ====================================================
  // LOAD USER DATA
  // ====================================================

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",

        university: user.university || "",

        department: user.department || "",

        semester: user.semester || "",

        bio: user.bio || "",

        interests: user.interests || [],

        skills: user.skills || [],

        friendshipGoals: user.friendshipGoals || [],
      });
    }
  }, [user]);

  // ====================================================
  // CLEAN IMAGE PREVIEW
  // ====================================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ====================================================
  // NORMAL INPUT CHANGE
  // ====================================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,

      [e.target.name]: e.target.value,
    }));
  };

  // ====================================================
  // PROFILE IMAGE URL
  // ====================================================

  const getProfilePicSrc = (profilePic) => {
    if (!profilePic) {
      return "";
    }

    // Already full URL or base64
    if (
      profilePic.startsWith("http://") ||
      profilePic.startsWith("https://") ||
      profilePic.startsWith("data:")
    ) {
      return profilePic;
    }

    // Backend uploads folder
    return `http://localhost:5000${profilePic}`;
  };

  // ====================================================
  // SELECT IMAGE
  // ====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a PNG, JPG, JPEG, or WEBP image.");

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");

      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ====================================================
  // UPLOAD IMAGE
  // ====================================================

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please choose an image first.");

      return;
    }

    try {
      setUploadingImage(true);

      setError("");
      setMessage("");

      const data = new FormData();

      data.append("profilePic", selectedImage);

      const res = await API.post("/users/me/profile-picture", data);

      // Update logged-in user
      updateUser(res.data);

      setSelectedImage(null);
      setImagePreview("");

      setMessage("Profile picture uploaded successfully.");
    } catch (err) {
      console.error("Profile picture upload error:", err);

      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.message || "Failed to upload profile picture.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm = () => {
    if (!user) return;

    setFormData({
      name: user.name || "",

      university: user.university || "",

      department: user.department || "",

      semester: user.semester || "",

      bio: user.bio || "",

      interests: user.interests || [],

      skills: user.skills || [],

      friendshipGoals: user.friendshipGoals || [],
    });
  };

  // ====================================================
  // OPEN EDIT
  // ====================================================

  const handleEdit = () => {
    resetForm();

    setSelectedImage(null);
    setImagePreview("");

    setMessage("");
    setError("");

    setIsEditing(true);
  };

  // ====================================================
  // CANCEL EDIT
  // ====================================================

  const handleCancel = () => {
    resetForm();

    setSelectedImage(null);
    setImagePreview("");

    setMessage("");
    setError("");

    setIsEditing(false);
  };

  // ====================================================
  // SAVE PROFILE INFORMATION
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setMessage("");
    setError("");

    try {
      // These three fields are already arrays
      const payload = {
        name: formData.name,

        university: formData.university,

        department: formData.department,

        semester: formData.semester,

        bio: formData.bio,

        interests: formData.interests,

        skills: formData.skills,

        friendshipGoals: formData.friendshipGoals,
      };

      const res = await API.put("/users/me", payload);

      updateUser(res.data);

      setMessage("Profile updated successfully.");

      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);

      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6FFEA] flex items-center justify-center">
        <p className="text-gray-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F6FFEA]
        py-10
        px-4
      "
    >
      {/* Background decoration */}
      <div
        className="
          pointer-events-none
          absolute
          -top-32
          -left-32
          w-80
          h-80
          bg-[#FA855A]
          opacity-20
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          top-40
          -right-32
          w-80
          h-80
          bg-[#62C4DA]
          opacity-20
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/3
          w-72
          h-72
          bg-[#FFDE96]
          opacity-20
          blur-3xl
          rounded-full
        "
      />

      {/* ================================================= */}
      {/* PROFILE VIEW */}
      {/* ================================================= */}

      {!isEditing && (
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Message */}
          {message && (
            <div
              className="
                mb-5
                bg-white
                border
                border-[#62C4DA]
                text-gray-800
                font-medium
                px-5
                py-3
                rounded-2xl
                shadow-sm
              "
            >
              {message}
            </div>
          )}

          {/* Profile Card */}
          <div
            className="
              bg-white
              rounded-[34px]
              overflow-hidden
              shadow-xl
              border
              border-gray-100
            "
          >
            {/* Header */}
            <div
              className="
                relative
                bg-[#FA855A]
                px-7
                pt-8
                pb-28
              "
            >
              <div
                className="
                  absolute
                  top-7
                  right-40
                  w-8
                  h-8
                  bg-[#FFDE96]
                  rotate-12
                  rounded-lg
                "
              />

              <div
                className="
                  absolute
                  bottom-6
                  left-8
                  w-16
                  h-3
                  bg-[#C93638]
                  rotate-[-4deg]
                  rounded-full
                  opacity-80
                "
              />

              <p
                className="
                  text-[#7E2728]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-xs
                "
              >
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
                  text-gray-900
                  px-5
                  py-2
                  rounded-full
                  font-bold
                  shadow-sm
                  hover:-translate-y-0.5
                  transition
                "
              >
                Edit Profile
              </button>
            </div>

            {/* =========================================== */}
            {/* PROFILE PICTURE - DISPLAY ONLY */}
            {/* =========================================== */}

            <div className="relative px-7">
              <div className="-mt-20 relative w-40 h-40">
                {user.profilePic ? (
                  <img
                    src={getProfilePicSrc(user.profilePic)}
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

            {/* Profile Information */}
            <div className="px-7 pb-8">
              {/* Name */}
              <div className="mt-5">
                <h1
                  className="
                    text-5xl
                    font-black
                    !text-black
                    leading-none
                  "
                >
                  {user.name}
                </h1>

                <p className="mt-3 text-gray-500 font-medium">{user.email}</p>
              </div>

              {/* University Information */}
              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-3
                "
              >
                {/* University */}
                <div
                  className="
                    bg-[#FFF9EA]
                    border
                    border-[#FFDE96]
                    rounded-[22px]
                    px-5
                    py-4
                  "
                >
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      font-bold
                      text-gray-500
                    "
                  >
                    University
                  </p>

                  <p className="mt-1 font-black text-gray-800 text-lg">
                    {user.university || "Not added"}
                  </p>
                </div>

                {/* Department */}
                <div
                  className="
                    bg-[#F3FBFD]
                    border
                    border-[#62C4DA]
                    rounded-[22px]
                    px-5
                    py-4
                  "
                >
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      font-bold
                      text-gray-500
                    "
                  >
                    Department
                  </p>

                  <p className="mt-1 font-black text-gray-800 text-lg">
                    {user.department || "Not added"}
                  </p>
                </div>

                {/* Semester */}
                <div
                  className="
                    bg-[#FFF6F2]
                    border
                    border-[#FA855A]
                    rounded-[22px]
                    px-5
                    py-4
                  "
                >
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      font-bold
                      text-gray-500
                    "
                  >
                    Semester
                  </p>

                  <p className="mt-1 font-black text-gray-800 text-lg">
                    {user.semester || "Not added"}
                  </p>
                </div>
              </div>

              {/* About */}
              <div
                className="
                  mt-8
                  bg-[#F6FFEA]/60
                  border
                  border-gray-200
                  rounded-[26px]
                  p-6
                "
              >
                <p
                  className="
                    uppercase
                    tracking-[0.2em]
                    text-xs
                    font-black
                    text-[#FA855A]
                    mb-3
                  "
                >
                  About Me
                </p>

                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  {user.bio ||
                    "Still working on something interesting to say here."}
                </p>
              </div>

              {/* ======================================= */}
              {/* INTERESTS */}
              {/* ======================================= */}

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Interests</h2>

                  <div className="h-[3px] flex-1 bg-[#FFDE96] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.interests?.length > 0 ? (
                    user.interests.map((interest) => (
                      <span
                        key={interest}
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

              {/* ======================================= */}
              {/* SKILLS */}
              {/* ======================================= */}

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Skills</h2>

                  <div className="h-[3px] flex-1 bg-[#62C4DA] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.skills?.length > 0 ? (
                    user.skills.map((skill) => (
                      <span
                        key={skill}
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

              {/* ======================================= */}
              {/* HERE FOR */}
              {/* ======================================= */}

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black !text-black">Here For</h2>

                  <div className="h-[3px] flex-1 bg-[#FA855A] rounded-full" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {user.friendshipGoals?.length > 0 ? (
                    user.friendshipGoals.map((goal) => (
                      <span
                        key={goal}
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

              {/* Edit */}
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
                  shadow-md
                "
              >
                Edit My Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT PROFILE */}
      {/* ================================================= */}

      {isEditing && (
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Heading */}
          <div className="mb-7">
            <p
              className="
                uppercase
                text-[#FA855A]
                tracking-[0.24em]
                text-xs
                font-bold
              "
            >
              Your profile
            </p>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-black
                !text-black
                mt-2
              "
            >
              Edit Profile
            </h1>

            <p className="text-gray-500 mt-2">
              Update what people see on your FriendLoop profile.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                bg-red-50
                border
                border-red-200
                text-red-700
                p-4
                rounded-2xl
                mb-5
                font-medium
              "
            >
              {error}
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className="
                bg-green-50
                border
                border-green-200
                text-green-700
                p-4
                rounded-2xl
                mb-5
                font-medium
              "
            >
              {message}
            </div>
          )}

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
              space-y-7
            "
          >
            {/* ======================================= */}
            {/* PROFILE PICTURE UPLOAD */}
            {/* ======================================= */}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Profile Picture
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Preview */}
                <div className="shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selected Preview"
                      className="
                        w-28
                        h-28
                        rounded-[24px]
                        object-cover
                        shadow-md
                      "
                    />
                  ) : user.profilePic ? (
                    <img
                      src={getProfilePicSrc(user.profilePic)}
                      alt="Current Profile"
                      className="
                        w-28
                        h-28
                        rounded-[24px]
                        object-cover
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
                      "
                    >
                      <span className="text-white text-4xl font-black">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {/* Choose File */}
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
                      file:px-4
                      file:rounded-full
                      file:border-0
                      file:bg-[#FFDE96]
                      file:text-black
                      file:font-semibold
                      hover:file:bg-[#F7CF78]
                      cursor-pointer
                    "
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, JPEG or WEBP. Maximum 5 MB.
                  </p>

                  {/* Upload Picture */}
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className="
                        mt-4
                        bg-[#FA855A]
                        text-white
                        px-5
                        py-2.5
                        rounded-xl
                        font-semibold
                        hover:bg-[#C93638]
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      {uploadingImage ? "Uploading..." : "Upload Picture"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* ======================================= */}
            {/* FULL NAME */}
            {/* ======================================= */}

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

            {/* ======================================= */}
            {/* UNIVERSITY + DEPARTMENT */}
            {/* ======================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            {/* ======================================= */}
            {/* SEMESTER */}
            {/* ======================================= */}

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

            {/* ======================================= */}
            {/* ABOUT */}
            {/* ======================================= */}

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

            {/* ======================================= */}
            {/* INTERESTS MULTI SELECT */}
            {/* ======================================= */}

            <MultiSelectDropdown
              label="Interests"
              options={interestOptions}
              selected={formData.interests}
              placeholder="Select your interests"
              accent="#E7B84B"
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,

                  interests: selected,
                }))
              }
            />

            {/* ======================================= */}
            {/* SKILLS MULTI SELECT */}
            {/* ======================================= */}

            <MultiSelectDropdown
              label="Skills"
              options={skillOptions}
              selected={formData.skills}
              placeholder="Select your skills"
              accent="#62C4DA"
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,

                  skills: selected,
                }))
              }
            />

            {/* ======================================= */}
            {/* HERE FOR MULTI SELECT */}
            {/* ======================================= */}

            <MultiSelectDropdown
              label="Here For"
              options={friendshipGoalOptions}
              selected={formData.friendshipGoals}
              placeholder="Select what you're here for"
              accent="#FA855A"
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,

                  friendshipGoals: selected,
                }))
              }
            />

            {/* ======================================= */}
            {/* BUTTONS */}
            {/* ======================================= */}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
