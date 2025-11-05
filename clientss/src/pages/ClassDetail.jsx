import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function ClassDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clazz, setClazz] = useState(null);

  // Mock data for now
  const mockClasses = [
    {
      _id: "1",
      title: "JavaScript Fundamentals",
      description:
        "Learn the essentials of modern JavaScript, including syntax, DOM manipulation, and ES6+ features. Perfect for beginners or anyone refreshing their web skills.",
      instructor: "Sarah Johnson",
      cost: 5,
      durationMinutes: 120,
      platform: "Google Meet",
      rating: 4.8,
    },
    {
      _id: "2",
      title: "Digital Photography",
      description:
        "Master the art of digital photography with lessons on lighting, composition, and editing techniques using both DSLR and mobile cameras.",
      instructor: "Mike Chen",
      cost: 7,
      durationMinutes: 90,
      platform: "Zoom",
      rating: 4.9,
    },
    {
      _id: "3",
      title: "Spanish Conversation",
      description:
        "Practice conversational Spanish with native speakers and improve your fluency through guided discussions and interactive exercises.",
      instructor: "Maria Rodriguez",
      cost: 4,
      durationMinutes: 60,
      platform: "MS Teams",
      rating: 4.7,
    },
  ];

  useEffect(() => {
    // simulate fetching from backend
    const found = mockClasses.find((c) => c._id === id);
    setClazz(found || null);
  }, [id]);

  if (!clazz) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-700">
        <p className="text-lg">Class not found or unavailable.</p>
        <button
          onClick={() => navigate("/classes")}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        > Back to Classes  </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{clazz.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-6">
          <p>
            <span className="font-medium text-gray-900">Instructor:</span>{" "}
            {clazz.instructor}
          </p>
          <p>
            <span className="font-medium text-gray-900">Platform:</span>{" "}
            {clazz.platform}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-8">{clazz.description}</p>

        {/* Details Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-lg font-semibold text-blue-700">
              {clazz.durationMinutes} min
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Cost</p>
            <p className="text-lg font-semibold text-green-700">
              {clazz.cost} credits
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Rating</p>
            <p className="text-lg font-semibold text-yellow-600">
              ⭐ {clazz.rating}
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold text-indigo-700">Active</p>
          </div>
        </div>

        {/* Join Button */}
        {user ? (
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
            Join This Class
          </button>
        ) : (
          <div className="mt-4 bg-gray-100 text-gray-700 px-5 py-3 rounded-lg">
            Please{" "}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              sign in
            </span>{" "}
            to join or enroll in this class.
          </div>
        )}
      </div>

      {/* Related classes section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          You may also like
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClasses
            .filter((c) => c._id !== id)
            .map((c) => (
              <div
                key={c._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {c.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  by {c.instructor}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">
                    {c.cost} credits
                  </span>
                  <button
                    onClick={() => navigate(`/classes/${c._id}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
