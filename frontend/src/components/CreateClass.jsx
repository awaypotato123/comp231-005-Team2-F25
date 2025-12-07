import { useState, useEffect } from "react";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function CreateClass() {
  const { push } = useToasts();
  const [skill, setSkill] = useState(""); // Store skill ID, not title
  const [classTitle, setClassTitle] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState(0);
  const [classDate, setClassDate] = useState(""); // Empty initially
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    // Set default date to tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const formatted = tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    setClassDate(formatted);
  }, []);

  // Fetch the current user's profile including skills
  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setUserProfile(response.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      push("Failed to load user profile", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!classTitle.trim()) {
      push("Please enter a class title", "error");
      return;
    }

    if (!classDescription.trim()) {
      push("Please enter a class description", "error");
      return;
    }

    if (!skill) {
      push("Please select a skill", "error");
      return;
    }

    if (!maxStudents || maxStudents <= 0) {
      push("Please enter a valid number of max students", "error");
      return;
    }

    if (!classDate) {
      push("Please select a class date", "error");
      return;
    }

    const newClass = {
      title: classTitle,
      description: classDescription,
      skillId: skill, // Send skill ID, not title
      date: new Date(classDate).toISOString(), // Convert to ISO string
      maxStudents: parseInt(maxStudents),
    };

    console.log("Sending class data:", newClass); // Debug log

    try {
      await api.post("/classes", newClass);
      push("Class created successfully!", "success");
      navigate("/classroom");
    } catch (error) {
      console.error("Error creating class:", error);
      console.error("Error response:", error.response?.data); // Show backend error
      push(error.response?.data?.message || "Failed to create class", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Class</h2>

      <form onSubmit={handleSubmit}>
        {/* Class Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Title *
          </label>
          <input
            type="text"
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
            placeholder="e.g., Python Programming 101"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Class Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Description *
          </label>
          <textarea
            value={classDescription}
            onChange={(e) => setClassDescription(e.target.value)}
            placeholder="Describe what students will learn in this class..."
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Max Students */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Students *
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={maxStudents}
            onChange={(e) => setMaxStudents(e.target.value)}
            placeholder="e.g., 20"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Select Skill */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Skill *
          </label>
          {userProfile && userProfile.skills && userProfile.skills.length > 0 ? (
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              required
            >
              <option value="">Select a skill you want to teach</option>
              {userProfile.skills.map((skillItem) => (
                <option key={skillItem._id} value={skillItem._id}>
                  {skillItem.title} ({skillItem.category})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                You don't have any skills yet. Please add a skill first from your Dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Class Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Date *
          </label>
          <input
            type="datetime-local"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)} // Can't select past dates
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Select when this class will take place
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Create Class
        </button>
      </form>
    </div>
  );
}