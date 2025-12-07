import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";
import api from "../lib/api";

export default function BookingRequests() {
  const { user } = useAuth();
  const { push } = useToasts();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseType, setResponseType] = useState("");
  const [responseData, setResponseData] = useState({
    teacherResponse: "",
    meetingLink: ""
  });

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const response = await api.get("/bookings/requests");
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      push("Failed to load booking requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponseModal = (booking, type) => {
    setSelectedBooking(booking);
    setResponseType(type);
    setResponseData({ teacherResponse: "", meetingLink: "" });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedBooking) return;

    try {
      if (responseType === "accept") {
        await api.put(`/bookings/${selectedBooking._id}/accept`, responseData);
        push("Booking accepted successfully!", "success");
      } else {
        await api.put(`/bookings/${selectedBooking._id}/reject`, {
          teacherResponse: responseData.teacherResponse
        });
        push("Booking rejected. Credit refunded to learner.", "success");
      }
      
      setShowResponseModal(false);
      fetchBookingRequests();
    } catch (error) {
      push(error.response?.data?.message || "Failed to process booking", "error");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage learning session requests from students
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No booking requests</h3>
            <p className="text-gray-600">
              You haven't received any booking requests yet.
            </p>
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
                      Request from {booking.learnerId?.firstName} {booking.learnerId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{booking.learnerId?.email}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

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

                {booking.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Student's Message:</p>
                    <p className="text-gray-900">{booking.message}</p>
                  </div>
                )}

                {booking.teacherResponse && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1 font-medium">
                      Your Response:
                    </p>
                    <p className="text-gray-900">{booking.teacherResponse}</p>
                  </div>
                )}

                {booking.meetingLink && (
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

                <div className="flex gap-3 pt-4 border-t">
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleOpenResponseModal(booking, "accept")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleOpenResponseModal(booking, "reject")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <span className="text-sm text-gray-500 flex items-center ml-auto">
                    Requested on {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {responseType === "accept" ? "Accept Booking" : "Reject Booking"}
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={responseData.teacherResponse}
                  onChange={(e) =>
                    setResponseData({ ...responseData, teacherResponse: e.target.value })
                  }
                  placeholder={
                    responseType === "accept"
                      ? "Great! I'd be happy to teach you..."
                      : "Sorry, I'm not available at this time..."
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {responseType === "accept" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link (Zoom, Google Meet, etc.)
                  </label>
                  <input
                    type="url"
                    value={responseData.meetingLink}
                    onChange={(e) =>
                      setResponseData({ ...responseData, meetingLink: e.target.value })
                    }
                    placeholder="https://zoom.us/j/123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    responseType === "accept"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {responseType === "accept" ? "Accept Booking" : "Reject Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}