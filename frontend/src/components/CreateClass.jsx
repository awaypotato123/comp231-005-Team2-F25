import { useState, useEffect } from "react";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function CreateClass() {
  const { push } = useToasts();
  const [skill, setSkill] = useState(""); // State to store selected skill
  const [classTitle, setClassTitle] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState(0);
  const [classDate, setClassDate] = useState("2025-12-01T10:00:00Z"); // Hardcoded class date for now
  const [userProfile, setUserProfile] = useState(null); // State to store user profile
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch the current user's profile including skills
  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setUserProfile(response.data.user); // Assuming the profile has a 'skills' array
    } catch (error) {
      console.error("Error fetching user profile:", error);
      push("Failed to load user profile", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newClass = {
      title: classTitle,
      description: classDescription,
      skillTitle: skill, // Selected skill
      date: classDate, // Hardcoded date for now, can be adjusted to a date picker
      maxStudents,
    };

    try {
      const response = await api.post("/classes/create", newClass);
      push("Class created successfully!", "success");
      navigate("/classroom");
    } catch (error) {
      console.error("Error creating class:", error);
      push("Failed to create class", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Class</h2>

      {/* Class Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Class Title</label>
        <input
          type="text"
          value={classTitle}
          onChange={(e) => setClassTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Class Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Class Description</label>
        <textarea
          value={classDescription}
          onChange={(e) => setClassDescription(e.target.value)}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Max Students */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
        <input
          type="number"
          value={maxStudents}
          onChange={(e) => setMaxStudents(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Select Skill */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Skill</label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          required
        >
          <option value="">Select Skill</option>
          {userProfile && userProfile.skills && userProfile.skills.length > 0 ? (
            userProfile.skills.map((skillItem) => (
              <option key={skillItem._id} value={skillItem.title}>
                {skillItem.title}
              </option>
            ))
          ) : (
            <option value="">No skills available</option>
          )}
        </select>
      </div>

      {/* Class Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Class Date</label>
        <input
          type="datetime-local"
          value={classDate}
          onChange={(e) => setClassDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
      >
        Create Class
      </button>
    </div>
  );
}
