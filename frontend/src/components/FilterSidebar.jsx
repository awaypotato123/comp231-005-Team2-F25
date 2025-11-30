export default function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
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

  const levels = ["beginner", "intermediate", "advanced"];

  const handleCategoryChange = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleLevelChange = (level) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter(l => l !== level)
      : [...filters.levels, level];
    
    onFilterChange({ ...filters, levels: newLevels });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skill Level Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Skill Level</h3>
        <div className="space-y-2">
          {levels.map((level) => (
            <label
              key={level}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={filters.levels.includes(level)}
                onChange={() => handleLevelChange(level)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.categories.length > 0 || filters.levels.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}
                <button
                  onClick={() => handleCategoryChange(category)}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.levels.map((level) => (
              <span
                key={level}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {level}
                <button
                  onClick={() => handleLevelChange(level)}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}