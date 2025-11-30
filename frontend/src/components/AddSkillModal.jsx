import { useState } from "react";

export default function AddSkillModal({ isOpen, onClose, onSkillAdded }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner"
  });

  const categories = [
    "Programming",
    "Design",
    "Languages",
    "Business",
    "Music",
    "Fitness",
    "Cooking",
    "Photography",
    "Writing",
    "Marketing"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSkillAdded(form);
      // Reset form
      setForm({
        title: "",
        description: "",
        category: "",
        level: "beginner"
      });
      onClose();
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Skill</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Skill Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g., JavaScript Fundamentals, Guitar for Beginners..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe what you'll teach, who it's for, and what students will learn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {form.description.length} characters
            </p>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                form.level === "beginner"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              }`}>
                <input
                  type="radio"
                  name="level"
                  value="beginner"
                  checked={form.level === "beginner"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  form.level === "beginner" ? "text-green-700" : "text-gray-700"
                }`}>
                  Beginner
                </span>
              </label>

              <label className={`relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                form.level === "intermediate"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:border-yellow-300"
              }`}>
                <input
                  type="radio"
                  name="level"
                  value="intermediate"
                  checked={form.level === "intermediate"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  form.level === "intermediate" ? "text-yellow-700" : "text-gray-700"
                }`}>
                  Intermediate
                </span>
              </label>

              <label className={`relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                form.level === "advanced"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-red-300"
              }`}>
                <input
                  type="radio"
                  name="level"
                  value="advanced"
                  checked={form.level === "advanced"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  form.level === "advanced" ? "text-red-700" : "text-gray-700"
                }`}>
                  Advanced
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}