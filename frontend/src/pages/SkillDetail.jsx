import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function SkillDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);

  // Fetch skill details on mount / id change
  useEffect(() => {
    fetchSkillDetails();
  }, [id]);

  const fetchSkillDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/skills/${id}`);
      setSkill(response.data);
    } catch (err) {
      console.error("Error fetching skill details:", err);
      setError("Failed to load skill details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSkill = async () => {
    if (!user || !skill?._id) return;

    try {
      setRequesting(true);
      await api.post(`/skills/request/${skill._id}`);
      alert("Your request has been sent successfully!");
    } catch (err) {
      console.error("Error requesting skill:", err);
      alert("Failed to send request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Skill Not Found</h2>
          <p className="mt-2 text-gray-600">{error || "This skill doesn't exist or has been removed."}</p>
          <button
            onClick={() => navigate("/browse")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-100 hover:text-white mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{skill.title}</h1>
              <p className="text-blue-100 text-lg">{skill.category}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                levelColors[skill.level] || "bg-gray-100 text-gray-800"
              }`}
            >
              {skill.level}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Skill</h2>
            <p className="text-gray-700 leading-relaxed">
              {skill.description || "No description provided for this skill."}
            </p>
          </div>

          {/* Instructor Info */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {skill.userId?.firstName?.[0]}{skill.userId?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {skill.userId?.firstName} {skill.userId?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{skill.userId?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Role: {skill.userId?.role || "Instructor"}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Skill Level</p>
              <p className="text-lg font-semibold text-blue-700 capitalize">
                {skill.level}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="text-lg font-semibold text-green-700">
                {skill.category || "General"}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-lg font-semibold text-purple-700">
                {new Date(skill.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {user ? (
              <>
                <button
                  onClick={handleRequestSkill}
                  disabled={requesting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {requesting ? "Requesting..." : "Request to Learn"}
                </button>
                <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                  Contact Instructor
                </button>
              </>
            ) : (
              <div className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-center">
                Please{" "}
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                  sign in
                </span>{" "}
                to request this skill
              </div>
            )}
          </div>
        </div>

        {/* Related Skills Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            More Skills in {skill.category}
          </h2>
          <p className="text-gray-600">
            Check out the{" "}
            <button
              onClick={() => navigate("/browse")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse page
            </button>{" "}
            to discover similar skills
          </p>
        </div>
      </div>
    </div>
  );
}
