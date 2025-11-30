import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";

export default function EditClass() {
  const { push } = useToasts();
  const navigate = useNavigate();
  const { classId } = useParams(); // Get class ID from URL

  const [classData, setClassData] = useState({
    title: "",
    description: "",
    skillTitle: "", // This is the skill name, not _id
    date: "",
    maxStudents: 0,
  });

  const [userProfile, setUserProfile] = useState(null); // State to store user profile

  useEffect(() => {
    // Fetch class data and user profile on component mount
    const fetchData = async () => {
      await fetchClassData();
      await fetchUserProfile(); // Ensure both data fetching happens in sequence
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
        skillTitle: response.data.skill.title, // Assuming the skill is embedded
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
      setUserProfile(response.data.user); // Assuming the profile has a 'skills' array
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

  // Handle form submission (update class data)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure skillTitle is correctly passed
    const updatedClassData = {
      title: classData.title,
      description: classData.description,
      skillTitle: classData.skillTitle, // This is the selected skill's title
      date: classData.date, // Make sure the date is correctly formatted
      maxStudents: classData.maxStudents,
    };

    try {
      await api.put(`/classes/${classId}`, updatedClassData);
      push("Class updated successfully!", "success");
      navigate("/dashboard"); // Redirect to dashboard after editing the class
    } catch (error) {
      push(error.response?.data?.message || "Error updating class", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Class</h2>

      {/* Class Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Class Title</label>
        <input
          type="text"
          name="title"
          value={classData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Class Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={classData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Max Students */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
        <input
          type="number"
          name="maxStudents"
          value={classData.maxStudents}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Select Skill */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Skill</label>
        <select
          name="skillTitle"
          value={classData.skillTitle}  // The current class skill will be selected here
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          name="date"
          value={classData.date ? classData.date.slice(0, 16) : ""} // Ensure correct format for datetime-local
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
      >
        Save Changes
      </button>
    </div>
  );
}
