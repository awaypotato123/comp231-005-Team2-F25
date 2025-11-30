import { useState, useEffect } from "react";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";
import AddSkillModal from "../components/AddSkillModal";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { push } = useToasts();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    profilePicture: ""
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setUserProfile(response.data.user);
      setProfileForm({
        firstName: response.data.user.firstName || "",
        lastName: response.data.user.lastName || "",
        bio: response.data.user.bio || "",
        profilePicture: response.data.user.profilePicture || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      push("Failed to load profile", "error");
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/users/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      push("Please select an image file", "error");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      push("Image size should be less than 2MB", "error");
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profilePicture: reader.result });
        push("Image uploaded! Click 'Save Changes' to update your profile", "success");
        setUploadingImage(false);
      };
      reader.onerror = () => {
        push("Failed to upload image", "error");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      push("Failed to upload image", "error");
      setUploadingImage(false);
    }
  };

  const removeProfilePicture = () => {
    setProfileForm({ ...profileForm, profilePicture: "" });
    push("Profile picture removed. Click 'Save Changes' to update", "info");
  };

  const handleAddSkill = async (skillData) => {
    try {
      await api.post("/skills", skillData);
      push("Skill added successfully!", "success");
      fetchUserProfile(); // Refresh to show new skill
      fetchUserStats(); // Update stats
    } catch (error) {
      push(error.response?.data?.message || "Failed to add skill", "error");
      throw error;
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      await api.delete(`/skills/${skillId}`);
      push("Skill deleted successfully", "success");
      fetchUserProfile();
      fetchUserStats();
    } catch (error) {
      push(error.response?.data?.message || "Failed to delete skill", "error");
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }

    try {
      await api.delete(`/classes/${classId}`);
      push("Class deleted successfully", "success");
      fetchUserClasses(); // Refresh classes
    } catch (error) {
      push(error.response?.data?.message || "Failed to delete class", "error");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile", profileForm);
      push("Profile updated successfully!", "success");
      fetchUserProfile();
    } catch (error) {
      push(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      push("Passwords don't match", "error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      push("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      await api.put("/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      push("Password updated successfully!", "success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      push(error.response?.data?.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              {userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
                  {getInitials(userProfile.firstName, userProfile.lastName)}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <p className="text-blue-100 mt-1">{userProfile.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900">
                  💰 {userProfile.credits} Credits
                </span>
              </div>
            </div>
          </div>

          {userProfile.bio && (
            <p className="mt-4 text-blue-50">{userProfile.bio}</p>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Stats content (similar to your existing stats cards) */}
          </div>
        )}

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === "security"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === "skills"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Skills
              </button>
              
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, firstName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, bio: e.target.value })
                      }
                      rows="4"
                      maxLength="500"
                      placeholder="Tell others about yourself, your interests, and what skills you'd like to share or learn..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {profileForm.bio.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    
                    {/* Current Picture Preview */}
                    {profileForm.profilePicture && (
                      <div className="mb-4">
                        <div className="relative inline-block">
                          <img
                            src={profileForm.profilePicture}
                            alt="Profile preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {uploadingImage ? "Uploading..." : "Upload Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      
                      {profileForm.profilePicture && (
                        <span className="text-sm text-green-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Image ready
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: Square image, max 2MB (JPG, PNG, GIF)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Change Password</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...profileForm, newPassword: e.target.value })
                      }
                      required
                      minLength="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                      minLength="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">My Skills</h2>
                  <button
                    onClick={() => setShowAddSkillModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Skill
                  </button>
                </div>

                {userProfile.skills && userProfile.skills.length > 0 ? (
                  <div className="grid gap-4">
                    {userProfile.skills.map((skill) => (
                      <div
                        key={skill._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{skill.title}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  skill.level === "beginner"
                                    ? "bg-green-100 text-green-800"
                                    : skill.level === "intermediate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {skill.level}
                              </span>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-md">
                                {skill.category}
                              </span>
                              <span className="text-gray-500">
                                Added {new Date(skill.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSkill(skill._id)}
                            className="ml-4 text-red-600 hover:text-red-700 p-2"
                            title="Delete skill"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No skills yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first skill to teach</p>
                    <button
                      onClick={() => setShowAddSkillModal(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Skill
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={showAddSkillModal}
        onClose={() => setShowAddSkillModal(false)}
        onSkillAdded={handleAddSkill}
      />
    </div>
  );
}