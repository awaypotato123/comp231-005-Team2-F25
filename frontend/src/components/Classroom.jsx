import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const isClassCompleted = (classDate) => {
  const today = new Date();
  const classDateTime = new Date(classDate);
  return classDateTime < today;
};

export default function Classroom() {
  const { push } = useToasts();
  const [activePortal, setActivePortal] = useState("student");
  const [userClasses, setUserClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const navigate = useNavigate();

  const handlePortalToggle = (portal) => {
    setActivePortal(portal);
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUserClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/classes/user/classes");

      setUserClasses(
        Array.isArray(response.data) ? response.data : []
      );

    } catch (error) {
      console.error("Error fetching user classes:", error);
      setUserClasses([]); 
      push("Failed to load classes", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/classes/instructor");

      setClasses(
        Array.isArray(response.data) ? response.data : []
      );

    } catch (error) {
      console.error("Error fetching instructor classes:", error);
      setClasses([]);
      push("Failed to load classes", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("/requests/skills/");
      setPendingRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setPendingRequests([]);
    }
  };

  const handleFeedback = (classId, classTitle) => {
    push(`Ready to give feedback for: ${classTitle}`, "info");
    navigate(`/feedback/${classId}`);
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class")) return;

    try {
      await api.delete(`/classes/${classId}`);
      push("Class deleted successfully", "success");
      fetchInstructorClasses();
    } catch (error) {
      push(error.response?.data?.message || "Failed to delete class", "error");
    }
  };

  const goToPublicProfile = () => {
    if (!currentUser) return;
    navigate(`/profile/${currentUser._id}`);
  };

  useEffect(() => {
    fetchCurrentUser();

    if (activePortal === "student") {
      fetchUserClasses();
    } else if (activePortal === "instructor") {
      fetchInstructorClasses();
      fetchPendingRequests();
    }
  }, [activePortal]);

  return (
    <div className="flex h-screen">

      <div className="w-64 bg-gray-800 text-white p-6 fixed h-full overflow-y-auto">
        <div
          className={`cursor-pointer p-4 mb-4 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition ${
            activePortal === "student" ? "bg-blue-700" : ""
          }`}
          onClick={() => handlePortalToggle("student")}
        >
          Student Portal
        </div>

        <div
          className={`cursor-pointer p-4 mb-4 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition ${
            activePortal === "instructor" ? "bg-blue-700" : ""
          }`}
          onClick={() => handlePortalToggle("instructor")}
        >
          Instructor Portal
        </div>

        <div
          className="cursor-pointer p-4 mb-4 rounded-lg hover:bg-red-950 text-white transition"
          onClick={goToPublicProfile}
        >
          My Public Profile
        </div>

        <div
          className="cursor-pointer p-4 mb-4 rounded-lg hover:bg-green-700 text-white transition bg-gray-700"
          onClick={() => navigate("/instructor-feedback")}
        >
          📊 My Feedback
        </div>

        <div
          className="cursor-pointer p-4 mb-4 rounded-lg hover:bg-purple-700 text-white transition bg-gray-700"
          onClick={() => navigate("/my-bookings")}
        >
          📋 My Bookings
        </div>

        <div
          className="cursor-pointer p-4 mb-4 rounded-lg hover:bg-orange-700 text-white transition bg-gray-700"
          onClick={() => navigate("/booking-requests")}
        >
          📬 Booking Requests
        </div>
      </div>

      <div className="ml-64 w-full p-6">

        {activePortal === "student" && (
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

            {(!userClasses || userClasses.length === 0) && !loading ? (
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
                        <p className="text-sm text-gray-500 mt-2">
                          Date: {new Date(classItem.date).toLocaleDateString()}
                        </p>

                        {completed && (
                          <span className="text-xs font-medium inline-block py-1 px-2 rounded-full text-white bg-red-500 mt-2">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
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
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {activePortal === "instructor" && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-semibold text-gray-800">Instructor Portal</h2>

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

            {(!classes || classes.length === 0) && !loading ? (
              <p className="text-gray-500 mt-4">You have not created any classes yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <li key={classItem._id} className="flex justify-between items-center py-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{classItem.title}</h3>
                      <p className="text-sm text-gray-600">{classItem.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Date: {new Date(classItem.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/manage-class/${classItem._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Manage
                      </button>

                      <button
                        onClick={() => handleDeleteClass(classItem._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Delete
                      </button>
                    </div>

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