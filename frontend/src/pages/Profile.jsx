import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user, updateUser } = useAuth();

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

  // Load current user data
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Convert comma-separated strings to arrays
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
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Your Profile</h1>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* University & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">University</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="e.g. IUT"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. SWE"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium mb-1">Semester</label>
          <input
            type="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="e.g. 3rd"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            placeholder="Tell others about yourself..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Interests (comma separated)
          </label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="e.g. coding, football, music, reading"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Skills (comma separated)
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, Python, UI Design"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Friendship Goals */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Friendship Goals (comma separated)
          </label>
          <input
            type="text"
            name="friendshipGoals"
            value={formData.friendshipGoals}
            onChange={handleChange}
            placeholder="e.g. study partner, project partner, casual friends"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Profile Picture (simple URL or base64) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Profile Picture URL (optional)
          </label>
          <input
            type="text"
            name="profilePic"
            value={formData.profilePic}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {formData.profilePic && (
            <img
              src={formData.profilePic}
              alt="Preview"
              className="mt-3 w-24 h-24 rounded-full object-cover border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;