import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import ClassCard from "../components/ClassCard"; // Assuming you have a ClassCard component
import api from "../lib/api"; // Make sure this points to your API client

export default function Classes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [classes, setClasses] = useState([]);  // Store the list of classes
  const [filteredClasses, setFilteredClasses] = useState([]);  // Filtered classes after applying search and filters
  const [loading, setLoading] = useState(true);  // Loading state for the spinner
  const [error, setError] = useState(null);  // Error state for any failures
  
  const [filters, setFilters] = useState({
    categories: [],
    levels: []
  });

  // Fetch classes when the component mounts
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/classes");  // Adjust the API endpoint for classes
      setClasses(response.data);
      setFilteredClasses(response.data);  // Initialize filteredClasses with the fetched classes
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters whenever they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters, classes]);

  const applyFiltersAndSearch = () => {
    let filtered = [...classes];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.title.toLowerCase().includes(query) ||
          cls.description?.toLowerCase().includes(query) ||
          cls.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((cls) =>
        filters.categories.includes(cls.category)
      );
    }

    // Apply level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter((cls) =>
        filters.levels.includes(cls.level)
      );
    }

    setFilteredClasses(filtered);  // Update the filtered classes
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Update URL query params with the search query
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ categories: [], levels: [] });
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Browse Classes</h1>
          <p className="text-blue-100 mb-8">
            Discover and join classes taught by talented instructors
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for classes, categories, or instructors..."
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Classes Grid */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : "All Classes"}
              </h2>
              <p className="text-sm text-gray-600">
                {filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"} found
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchClasses}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredClasses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No classes found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Classes Grid */}
            {!loading && !error && filteredClasses.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredClasses.map((cls) => (
                  <ClassCard key={cls._id} classData={cls} />
                ))
                }
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
