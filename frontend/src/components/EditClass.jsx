import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";

export default function EditClass() {
  const { push } = useToasts();
  const navigate = useNavigate();
  const { classId } = useParams();

  const [classData, setClassData] = useState({
    title: "",
    description: "",
    skillId: "", // Changed from skillTitle to skillId
    date: "",
    maxStudents: 0,
  });

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchClassData();
      await fetchUserProfile();
    };

    fetchData();
  }, []);

  // Fetch the class data by classId
  const fetchClassData = async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      setClassData({
        title: response.data.title,
        description: response.data.description,
        skillId: response.data.skill._id, // Store skill ID, not title
        date: response.data.date,
        maxStudents: response.data.maxStudents,
      });
    } catch (error) {
      console.error("Error fetching class data:", error);
      push("Failed to load class data", "error");
    }
  };

  // Fetch the current user's profile, including skills
  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setUserProfile(response.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      push("Failed to load user profile", "error");
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData({ ...classData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!classData.title.trim()) {
      push("Please enter a class title", "error");
      return;
    }

    if (!classData.description.trim()) {
      push("Please enter a description", "error");
      return;
    }

    if (!classData.skillId) {
      push("Please select a skill", "error");
      return;
    }

    if (!classData.maxStudents || classData.maxStudents <= 0) {
      push("Please enter a valid number of max students", "error");
      return;
    }

    const updatedClassData = {
      title: classData.title,
      description: classData.description,
      skillId: classData.skillId, // Send skillId, not skillTitle
      date: new Date(classData.date).toISOString(), // Convert to ISO string
      maxStudents: parseInt(classData.maxStudents),
    };

    console.log("Sending update:", updatedClassData); // Debug log

    try {
      await api.put(`/classes/${classId}`, updatedClassData);
      push("Class updated successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);
      push(error.response?.data?.message || "Error updating class", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Class</h2>

      <form onSubmit={handleSubmit}>
        {/* Class Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Title *
          </label>
          <input
            type="text"
            name="title"
            value={classData.title}
            onChange={handleChange}
            placeholder="e.g., Python Programming 101"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Class Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={classData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe what students will learn..."
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
            name="maxStudents"
            min="1"
            max="100"
            value={classData.maxStudents}
            onChange={handleChange}
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
              name="skillId"
              value={classData.skillId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a skill</option>
              {userProfile.skills.map((skillItem) => (
                <option key={skillItem._id} value={skillItem._id}>
                  {skillItem.title} ({skillItem.category})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                You don't have any skills yet. Please add a skill first.
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
            name="date"
            value={classData.date ? classData.date.slice(0, 16) : ""}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
