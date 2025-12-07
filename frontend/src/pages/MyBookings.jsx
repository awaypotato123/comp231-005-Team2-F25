import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";
import api from "../lib/api";

export default function MyBookings() {
  const { user } = useAuth();
  const { push } = useToasts();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/my-bookings");
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      push("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking? Your credit will be refunded.")) return;

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      push("Booking cancelled. Credit refunded.", "success");
      fetchBookings();
    } catch (error) {
      push(error.response?.data?.message || "Failed to cancel booking", "error");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            View and manage your learning session bookings
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">
              Start learning by booking a session with a teacher!
            </p>
            <a
              href="/classes"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Skills
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.skillId?.title}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      with {booking.teacherId?.firstName} {booking.teacherId?.lastName}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {booking.preferredDate && (
                    <div>
                      <p className="text-sm text-gray-500">Preferred Date</p>
                      <p className="text-gray-900">
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {booking.preferredTime && (
                    <div>
                      <p className="text-sm text-gray-500">Preferred Time</p>
                      <p className="text-gray-900">{booking.preferredTime}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-gray-900">{booking.duration}</p>
                  </div>
                </div>

                {/* Your Message */}
                {booking.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Your Message:</p>
                    <p className="text-gray-900">{booking.message}</p>
                  </div>
                )}

                {/* Teacher Response */}
                {booking.teacherResponse && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1 font-medium">
                      Teacher's Response:
                    </p>
                    <p className="text-gray-900">{booking.teacherResponse}</p>
                  </div>
                )}

                {/* Meeting Link */}
                {booking.meetingLink && booking.status === "accepted" && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-2 font-medium">
                      Meeting Link:
                    </p>
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline break-all"
                    >
                      {booking.meetingLink}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.status === "accepted" && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Cancel Session
                    </button>
                  )}

                  <span className="text-sm text-gray-500 flex items-center">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}