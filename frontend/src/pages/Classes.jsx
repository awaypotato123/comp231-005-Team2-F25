import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Classes() {
  const { user } = useAuth();

  // temporary mock data
  const classes = [
    {
      _id: "1",
      title: "JavaScript Fundamentals",
      instructor: "Sarah Johnson",
      cost: 5,
      rating: 4.8,
    },
    {
      _id: "2",
      title: "Digital Photography",
      instructor: "Mike Chen",
      cost: 7,
      rating: 4.9,
    },
    {
      _id: "3",
      title: "Spanish Conversation",
      instructor: "Maria Rodriguez",
      cost: 4,
      rating: 4.7,
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Classes</h1>

      {!user ? (
        <p className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-8">
          Please{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            sign in
          </span>{" "}
          to join or explore classes.
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md p-5 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {cls.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">by {cls.instructor}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">
                  {cls.cost} credits
                </span>
                <span className="text-yellow-500 text-sm">⭐ {cls.rating}</span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to={`/classes/${cls._id}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
