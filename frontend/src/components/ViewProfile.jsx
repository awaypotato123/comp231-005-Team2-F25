import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function PublicProfile() {
  const { userId } = useParams();

  const [userProfile, setUserProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    fetchUserProfile();
    fetchAllClasses();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/public/${userId}`);
      setUserProfile(response.data.user);
    } catch (error) {
      console.error("Error fetching public profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClasses = async () => {
    try {
      const response = await api.get(`/classes`);
      const filtered = response.data.filter((cls) => cls.user === userId);
      setClasses(filtered);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        {/* Profile card left */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border-t-4 border-blue-600">

          {/* Avatar */}
          <div className="w-60 h-60 rounded-full overflow-hidden shadow mb-4 border-4 border-blue-600">
            {userProfile.profilePicture ? (
              <img
                src={userProfile.profilePicture}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl">
                {getInitials(userProfile.firstName, userProfile.lastName)}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900">
            {userProfile.firstName} {userProfile.lastName}
          </h1>

          {/* Email */}
          <p className="text-gray-500 mt-1">{userProfile.email}</p>

          {/* Bio */}
          {userProfile.bio && (
            <p className="mt-4 text-gray-700 text-sm leading-relaxed px-2">
              {userProfile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-lg font-bold text-blue-700 text-center">
                {userProfile.skills.length}
              </p>
              <p className="text-xs text-blue-600 text-center">Skills</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-lg font-bold text-blue-700 text-center">
                {classes.length}
              </p>
              <p className="text-xs text-blue-600 text-center">Classes</p>
            </div>
          </div>
        </div>

        {/* Right side content */}
        <div className="lg:col-span-2 flex flex-col gap-6">

         {/* Skills horizontal slider */}
<div
  className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600 flex flex-col"
  style={{ height: "170px" }}
>
  <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>

  {userProfile.skills && userProfile.skills.length > 0 ? (
    <div
      className="flex gap-3 overflow-x-auto h-full pr-1"
      style={{ scrollbarWidth: "thin" }}
    >
      {userProfile.skills.map((skill) => (
        <div
          key={skill._id}
          className="min-w-[180px] bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold text-blue-900 text-base">
              {skill.title}
            </p>

            <span
              className={`px-2 py-1 text-xs rounded-full ${
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

          <p className="text-sm text-blue-700 mt-2">{skill.category}</p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No skills added</p>
  )}
</div>

          {/* Classes full expanded section */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600 flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Classes</h2>

            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {classes.map((cls) => (
                  <div
                    key={cls._id}
                    className="bg-gray-50 border border-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cls.title}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {cls.description.substring(0, 120)}...
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Date: {new Date(cls.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classes created</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
