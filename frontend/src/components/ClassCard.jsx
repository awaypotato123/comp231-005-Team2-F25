import { useState } from "react";
import { useAuth } from "../context/AuthContext"; 
import api from '../lib/api';
import { Link } from "react-router-dom";
import BookingModal from './Bookingmodal';

export default function ClassCard({ classData }) {
  const { title, description, skill, userName, maxStudents, rating } = classData;
  const { user, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleRequestBooking = () => {
    closeModal();
    setIsBookingModalOpen(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">Skill: {skill.title}</p>
      <Link to={`/profile/${classData.user}`} className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline">
        Instructor: {userName}
      </Link>
      <p className="text-sm text-gray-600 mt-2">{description}</p>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-blue-600 font-medium">{maxStudents} students max</span>
        <span className="text-yellow-500 text-sm">⭐ {rating || "N/A"}</span>
      </div>

      <div className="mt-4">
        <button
          onClick={openModal}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          View Details
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl w-[80vw] max-w-3xl shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
            <p className="text-lg text-gray-500 mt-1">Skill: {skill.title}</p>
            <p className="text-lg text-gray-600 mt-2 underline">
              Instructor: <Link to={`/profile/${classData.user}`}>{userName}</Link>
            </p>
            <p className="text-lg text-gray-600 mt-4">{description}</p>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-blue-600 font-medium">{maxStudents} students max</span>
              <span className="text-yellow-500 text-lg">⭐ {rating || "N/A"}</span>
            </div>

            {user && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Cost:</span> 1 credit
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Your credits:</span> {user.credits} available
                  {user.pendingCredits > 0 && ` + ${user.pendingCredits} pending`}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              {user ? (
                <button
                  onClick={handleRequestBooking}
                  disabled={user.credits < 1}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    user.credits < 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Request to Join (1 Credit)
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-center">
                  Please{" "}
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                    sign in
                  </span>{" "}
                  to join this class
                </div>
              )}
              <button
                onClick={closeModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          skill={skill}
          teacher={{ _id: classData.user, firstName: userName.split(' ')[0], lastName: userName.split(' ')[1] || '' }}
          classData={classData}
        />
      )}
    </div>
  );
}