import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import ClassCard from "../components/ClassCard";
import api from "../lib/api";

export default function Classes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    categories: [],
    levels: []
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/classes");
      setClasses(response.data);
      setFilteredClasses(response.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters, classes]);

  const applyFiltersAndSearch = () => {
    let filtered = [...classes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.title.toLowerCase().includes(query) ||
          cls.description?.toLowerCase().includes(query) ||
          cls.category?.toLowerCase().includes(query)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((cls) =>
        filters.categories.includes(cls.category)
      );
    }

    if (filters.levels.length > 0) {
      filtered = filtered.filter((cls) =>
        filters.levels.includes(cls.level)
      );
    }

    setFilteredClasses(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Browse Classes</h1>
          <p className="text-blue-100 mb-8">
            Discover and join classes taught by talented instructors
          </p>
          
          <div className="max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for classes, categories, or instructors..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          <main className="flex-1">
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

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            )}

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
