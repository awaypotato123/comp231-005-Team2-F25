import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    alert(`Searching for: ${search}`);
  };

  return (
    <main className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white min-h-[85vh] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to SkillSwap
        </h1>
        <p className="text-lg md:text-2xl text-blue-100 mb-10">
          Learn new skills, teach what you know, grow together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="relative w-full sm:w-96">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for skills, classes, or instructors..."
              className="w-full px-4 py-3 pl-12 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="absolute left-4 top-3.5 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium"
          >
            Search Classes
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg">
            Get Started - Sign Up
          </button>
          <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium text-lg">
            Explore Classes
          </button>
        </div>
      </div>
    </main>
  );
}
