import React, { useState, useEffect } from 'react';
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

// Helper function to check if a class is completed
const isClassCompleted = (classDate) => {
  const today = new Date();
  const classDateTime = new Date(classDate);
  return classDateTime < today;
};

export default function Classroom() {
  const { push } = useToasts();
  const [activePortal, setActivePortal] = useState('student');
  const [userClasses, setUserClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const navigate = useNavigate();

  // Toggle between Student and Instructor portals
  const handlePortalToggle = (portal) => {
    setActivePortal(portal);
  };

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch classes the student is enrolled in
  const fetchUserClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/classes/user/classes");
      setUserClasses(response.data);
    } catch (error) {
      console.error("Error fetching user classes:", error);
      push("Failed to load classes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes the instructor has created
  const fetchInstructorClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/classes/instructor");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching instructor classes:", error);
      push("Failed to load classes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending skill requests from API
const fetchPendingRequests = async () => {
  if (!skill?._id) return; // make sure skill is loaded

  try {
    const response = await api.get("/requests/skills/"); 
    // Filter requests for the current skill
    const skillRequests = response.data.filter(
      (request) => request.skillId === skill._id
    );
    setPendingRequests(skillRequests); // expecting array of { studentName, classTitle, ... }
  } catch (error) {
    console.error("Error fetching pending requests:", error);
  }
};


  // Feedback handler
const handleFeedback = (classId, classTitle) => {
  // Use the classId to navigate to the specific feedback page
  console.log(`Navigating to feedback page for Class ID: ${classId}`);
  push(`Ready to give feedback for: ${classTitle}`, "info");
  navigate(`/feedback/${classId}`); 
};

  // Delete a class
  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/classes/${classId}`);
      push("Class deleted successfully", "success");
      fetchInstructorClasses();
    } catch (error) {
      push(error.response?.data?.message || "Failed to delete class", "error");
    }
  };

  // Navigate to public profile
  const goToPublicProfile = () => {
    if (!currentUser) return;
    navigate(`/profile/${currentUser._id}`);
  };

  // Load data when portal changes
  useEffect(() => {
    fetchCurrentUser();

    if (activePortal === 'student') {
      fetchUserClasses();
    } else if (activePortal === 'instructor') {
      fetchInstructorClasses();
      fetchPendingRequests();
    }
    
  }, [activePortal]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 fixed h-full">
        <div
          className={`cursor-pointer p-4 mb-4 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition ${activePortal === 'student' ? 'bg-blue-700' : ''}`}
          onClick={() => handlePortalToggle('student')}
        >
          Student Portal
        </div>
        <div
          className={`cursor-pointer p-4 mb-4 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition ${activePortal === 'instructor' ? 'bg-blue-700' : ''}`}
          onClick={() => handlePortalToggle('instructor')}
        >
          Instructor Portal
        </div>
        <div
          className="cursor-pointer p-4 mt-4 rounded-lg hover:bg-red-950 text-white transition"
          onClick={goToPublicProfile}
        >
          My Public Profile
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 w-full p-6">

        {/* Student Portal */}
        {activePortal === 'student' && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800">Student Portal</h2>
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg text-gray-600">My Classes</p>
              <button
                onClick={() => navigate("/classes")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Join a Class
              </button>
            </div>

            {loading && (
              <div className="text-center animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto my-4"></div>
            )}

            {userClasses.length === 0 ? (
              <p className="text-gray-500 mt-4">You have not joined any classes yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {userClasses.map((classItem) => {
                  const completed = isClassCompleted(classItem.date);
                  return (
                    <li key={classItem._id} className="flex justify-between items-center py-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{classItem.title}</h3>
                        <p className="text-sm text-gray-600">{classItem.description}</p>
                        <p className="text-sm text-gray-500 mt-2">Date: {new Date(classItem.date).toLocaleDateString()}</p>
                        {completed && (
                          <span className="text-xs font-medium inline-block py-1 px-2 rounded-full text-white bg-red-500 mt-2">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {/* --- NEW CONDITIONAL BUTTON --- */}
                        {completed ? (
                          <button
                            onClick={() => handleFeedback(classItem._id, classItem.title)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
                          >
                            Give Feedback
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/enter-class/${classItem._id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                          >
                            Enter Class
                          </button>
                        )}
                        {/* ------------------------------ */}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Instructor Portal */}
        {activePortal === 'instructor' && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-semibold text-gray-800">Instructor Portal</h2>

            {/* Requests Button */}
            <div className="absolute top-6 right-6">
              <button
                onClick={() => setShowRequestsModal(true)}
                className="relative bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Requests
                <span className="absolute -top-2 -right-2 bg-red-600 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {pendingRequests.length}
                </span>
              </button>
            </div>

            {/* Requests Modal */}
            {showRequestsModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-xl w-96 shadow-lg relative">
                  <h3 className="text-xl font-semibold mb-4">Pending Skill Requests</h3>
                  {pendingRequests.length === 0 ? (
                    <p className="text-gray-600">No pending requests</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                      {Object.entries(
                        pendingRequests.reduce((acc, req) => {
                          acc[req.classTitle] = (acc[req.classTitle] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([skillTitle, count], index) => (
                        <li key={index} className="py-2">
                          <span>{count} student(s) requested: {skillTitle}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => setShowRequestsModal(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <p className="text-lg text-gray-600">My Classes</p>
              <button
                onClick={() => navigate("/create-class")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create New Class
              </button>
            </div>

            {loading && (
              <div className="text-center animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto my-4"></div>
            )}

            {classes.length === 0 ? (
              <p className="text-gray-500 mt-4">You have not created any classes yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <li key={classItem._id} className="flex justify-between items-center py-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{classItem.title}</h3>
                      <p className="text-sm text-gray-600">{classItem.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Date: {new Date(classItem.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/manage-class/${classItem._id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Manage Class
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
