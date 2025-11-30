import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import SkillCard from "../components/SkillCard";
import ClassCard from "../components/ClassCard";
import api from "../lib/api";

export default function BrowseUnified() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // which type to browse: skills or classes
  const type = searchParams.get("type") || "skills";

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    categories: [],
    levels: []
  });

  // fetch skills or classes based on ?type=
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(type === "skills" ? "/skills" : "/classes");
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      console.error("Error fetching:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  // shared unified search and filter logic
  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters, items]);

  const applyFiltersAndSearch = () => {
    let filtered = [...items];

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      filtered = filtered.filter((item) => {
        if (type === "skills") {
          return (
            item.title.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q)
          );
        }

        if (type === "classes") {
          return (
            item.title.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.skill?.category?.toLowerCase().includes(q) ||
            item.skill?.level?.toLowerCase().includes(q) ||
            `${item.user?.firstName} ${item.user?.lastName}`
              .toLowerCase()
              .includes(q)
          );
        }

        return false;
      });
    }

    // category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) => {
        if (type === "skills") return filters.categories.includes(item.category);
        if (type === "classes") return filters.categories.includes(item.skill?.category);
      });
    }

    // level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter((item) => {
        if (type === "skills") return filters.levels.includes(item.level);
        if (type === "classes") return filters.levels.includes(item.skill?.level);
      });
    }

    setFilteredItems(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value) {
      setSearchParams({ type, q: value });
    } else {
      setSearchParams({ type });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ categories: [], levels: [] });
    setSearchQuery("");
    setSearchParams({ type });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">
            {type === "skills" ? "Browse Skills" : "Browse Classes"}
          </h1>

          <p className="text-blue-100 mb-8">
            {type === "skills"
              ? "Discover new skills you can learn"
              : "Join classes from expert instructors"}
          </p>

          <div className="max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={`Search for ${type}...`}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Filters */}
        <aside className="lg:w-64">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : type === "skills"
                ? "All Skills"
                : "All Classes"}
            </h2>

            <p className="text-sm text-gray-600">
              {filteredItems.length} {type === "skills" ? "skills" : "classes"}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchItems}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center bg-white p-10 rounded-lg border">
              <p className="text-gray-600">No results found</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) =>
                type === "skills" ? (
                  <SkillCard key={item._id} skill={item} />
                ) : (
                  <ClassCard key={item._id} classData={item} />
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
