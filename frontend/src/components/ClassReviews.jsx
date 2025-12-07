import { useState, useEffect } from "react";
import api from "../lib/api";

export default function ClassReviews({ classId }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (classId) {
      fetchFeedback();
    }
  }, [classId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/feedbacks/class/${classId}`);
      const feedbackData = response.data;
      
      setFeedbacks(feedbackData);
      calculateStats(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      setStats({ total: 0, averageRating: 0 });
      return;
    }

    const total = feedbackData.length;
    const sum = feedbackData.reduce((acc, fb) => acc + fb.rating, 0);
    const averageRating = (sum / total).toFixed(1);

    setStats({ total, averageRating });
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
      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Class Reviews</h2>
        {stats.total > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-yellow-500">{stats.averageRating}</span>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-sm text-gray-600">{stats.total} {stats.total === 1 ? 'review' : 'reviews'}</p>
          </div>
        )}
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500">
            Be the first to leave a review for this class!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback, index) => (
            <div
              key={feedback._id || index}
              className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {feedback.studentId?.firstName?.[0] || '?'}
                      {feedback.studentId?.lastName?.[0] || ''}
                    </span>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-900">
                      {feedback.studentId?.firstName} {feedback.studentId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-bold ${getRatingColor(feedback.rating)}`}>
                    {feedback.rating}/5
                  </div>
                  <div className="text-lg">
                    {getRatingStars(feedback.rating)}
                  </div>
                </div>
              </div>

              <div className="ml-15 pl-0">
                <p className="text-gray-700 leading-relaxed">
                  "{feedback.comments}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}