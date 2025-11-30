import { Link } from "react-router-dom";

export default function SkillCard({ skill }) {
  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800"
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {skill.title}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            levelColors[skill.level] || "bg-gray-100 text-gray-800"
          }`}
        >
          {skill.level}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {skill.description || "No description available"}
      </p>

      {/* Category */}
      {skill.category && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
            {skill.category}
          </span>
        </div>
      )}

      {/* Teacher Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {skill.userId?.firstName?.[0] || "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {skill.userId?.firstName} {skill.userId?.lastName}
            </p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>

        <Link
          to={`/skills/${skill._id}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}