import { useState, useEffect } from "react";
import api from "../lib/api";

export default function InstructorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get("/feedbacks/instructor");
      const feedbackData = response.data;
      
      setFeedbacks(feedbackData);
      calculateStats(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      return;
    }

    const total = feedbackData.length;
    const sum = feedbackData.reduce((acc, fb) => acc + fb.rating, 0);
    const averageRating = (sum / total).toFixed(1);

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackData.forEach(fb => {
      if (ratingBreakdown[fb.rating] !== undefined) {
        ratingBreakdown[fb.rating]++;
      }
    });

    setStats({ total, averageRating, ratingBreakdown });
  };

  const getRatingStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Class Feedback</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Total Reviews</p>
          <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Average Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-4xl font-bold text-yellow-500">{stats.averageRating}</p>
            <span className="text-2xl">⭐</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-3">Rating Distribution</p>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-1">
              <span className="text-sm w-8">{rating}⭐</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: stats.total > 0 
                      ? `${(stats.ratingBreakdown[rating] / stats.total) * 100}%` 
                      : '0%'
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 w-8">
                {stats.ratingBreakdown[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">All Reviews</h2>
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p className="text-gray-500">
              Feedback from students will appear here after they complete your classes.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {feedbacks.map((feedback, index) => (
              <div key={feedback._id || index} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {feedback.studentId?.firstName} {feedback.studentId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {feedback.studentId?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRatingColor(feedback.rating)} mb-1`}>
                      {feedback.rating}/5
                    </div>
                    <div className="text-lg">
                      {getRatingStars(feedback.rating)}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Class: {feedback.classId?.title || "Unknown Class"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-gray-700 italic">"{feedback.comments}"</p>
                </div>

                <p className="text-xs text-gray-500">
                  Submitted on {new Date(feedback.createdAt).toLocaleDateString()} at{" "}
                  {new Date(feedback.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}