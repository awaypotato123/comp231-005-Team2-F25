import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToasts } from "../context/ToastContext";
import ClassForm from '../components/ClassForm';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToasts();
  
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  
  
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  
  
  const [skills, setSkills] = useState([]);
  const [skillPage, setSkillPage] = useState(1);
  const [skillTotalPages, setSkillTotalPages] = useState(1);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("");

  useEffect(() => {
    
    if (!user || user.role !== "admin") {
      push("Access denied. Admin only.", "error");
      navigate("/");
      return;
    }
    
    fetchStats();
  }, [user, navigate, push]);

  useEffect(() => {
    if (activeSection === "manage-users") {
      fetchUsers();
    } else if (activeSection === "manage-skills") {
      fetchSkills();
    }
  }, [activeSection, userPage, userSearch, userRoleFilter, skillPage, skillSearch, skillCategoryFilter]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      push("Failed to load statistics", "error");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: userPage,
        limit: 10
      });
      
      if (userSearch) params.append("search", userSearch);
      if (userRoleFilter) params.append("role", userRoleFilter);
      
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setUserTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      push("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: skillPage,
        limit: 10
      });
      
      if (skillSearch) params.append("search", skillSearch);
      if (skillCategoryFilter) params.append("category", skillCategoryFilter);
      
      const response = await api.get(`/admin/skills?${params}`);
      setSkills(response.data.skills);
      setSkillTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching skills:", error);
      push("Failed to load skills", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      push(`User role updated to ${newRole}`, "success");
      fetchUsers();
    } catch (error) {
      push(error.response?.data?.message || "Failed to update role", "error");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user ${userName}? This will also delete all their skills!`)) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      push("User deleted successfully", "success");
      fetchUsers();
      fetchStats();
    } catch (error) {
      push(error.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const handleSuspendUser = async (userId, userName) => {
    if (!window.confirm(`Suspend user ${userName}? This will set their credits to 0.`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/suspend`);
      push("User suspended successfully", "success");
      fetchUsers();
    } catch (error) {
      push(error.response?.data?.message || "Failed to suspend user", "error");
    }
  };

  const handleAddCredits = async (userId, userName) => {
    const credits = prompt(`How many credits to add to ${userName}?`, "5");
    if (!credits || isNaN(credits) || credits <= 0) return;
    
    try {
      await api.put(`/admin/users/${userId}/credits`, { credits: parseInt(credits) });
      push(`Added ${credits} credits to ${userName}`, "success");
      fetchUsers();
    } catch (error) {
      push(error.response?.data?.message || "Failed to add credits", "error");
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPassword = prompt(`Enter new password for ${userName}:\n(Minimum 6 characters)`, "");
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      push("Password must be at least 6 characters", "error");
      return;
    }
    
    if (!window.confirm(`Reset password for ${userName}?\nNew password: ${newPassword}`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
      push(`Password reset successfully for ${userName}`, "success");
    } catch (error) {
      push(error.response?.data?.message || "Failed to reset password", "error");
    }
  };

  const handleDeleteSkill = async (skillId, skillTitle) => {
    if (!window.confirm(`Delete skill "${skillTitle}"?`)) return;
    
    try {
      await api.delete(`/admin/skills/${skillId}`);
      push("Skill deleted successfully", "success");
      fetchSkills();
      fetchStats();
    } catch (error) {
      push(error.response?.data?.message || "Failed to delete skill", "error");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-200 p-4 overflow-y-auto">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={`text-lg w-full text-left px-2 py-1 rounded ${
                  activeSection === "dashboard" ? "bg-gray-300 font-semibold" : "text-gray-700"
                }`}
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("create-class")}
                className={`text-lg w-full text-left px-2 py-1 rounded ${
                  activeSection === "create-class" ? "bg-gray-300 font-semibold" : "text-gray-700"
                }`}
              >
                ➕ Create Class
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("manage-users")}
                className={`text-lg w-full text-left px-2 py-1 rounded ${
                  activeSection === "manage-users" ? "bg-gray-300 font-semibold" : "text-gray-700"
                }`}
              >
                👥 Manage Users
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("manage-skills")}
                className={`text-lg w-full text-left px-2 py-1 rounded ${
                  activeSection === "manage-skills" ? "bg-gray-300 font-semibold" : "text-gray-700"
                }`}
              >
                📚 Manage Skills
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && stats && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
              
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                      <p className="text-blue-100 text-xs mt-2">+{stats.recentUsers} this week</p>
                    </div>
                    <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Skills</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalSkills}</p>
                      <p className="text-green-100 text-xs mt-2">+{stats.recentSkills} this week</p>
                    </div>
                    <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Learners</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalLearners}</p>
                    </div>
                    <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Teachers</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalTeachers}</p>
                    </div>
                    <svg className="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills by Category</h3>
                <div className="space-y-3">
                  {stats.skillsByCategory.map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between">
                      <span className="text-gray-700">{cat._id}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(cat.count / stats.totalSkills) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-600 font-medium w-12 text-right">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills by Level</h3>
                <div className="grid grid-cols-3 gap-4">
                  {stats.skillsByLevel.map((level) => (
                    <div
                      key={level._id}
                      className={`p-4 rounded-lg ${
                        level._id === "beginner"
                          ? "bg-green-50 border border-green-200"
                          : level._id === "intermediate"
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p className="text-sm text-gray-600 capitalize">{level._id}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{level.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          
          {activeSection === "create-class" && (
            <section>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Create a New Class</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <ClassForm />
              </div>
            </section>
          )}

          
          {activeSection === "manage-users" && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Manage Users</h2>
              
              
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="learner">Learner</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {u.firstName} {u.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                            <td className="px-4 py-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                                className="text-sm px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="learner">Learner</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{u.credits}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{u.skills?.length || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleAddCredits(u._id, `${u.firstName} ${u.lastName}`)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Add credits"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleResetPassword(u._id, `${u.firstName} ${u.lastName}`)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Reset password"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleSuspendUser(u._id, `${u.firstName} ${u.lastName}`)}
                                  className="text-yellow-600 hover:text-yellow-700"
                                  title="Suspend user"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete user"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  
                  <div className="p-4 flex items-center justify-between border-t">
                    <button
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {userPage} of {userTotalPages}
                    </span>
                    <button
                      onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                      disabled={userPage === userTotalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

         
          {activeSection === "manage-skills" && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Manage Skills</h2>
              
              
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setSkillPage(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={skillCategoryFilter}
                  onChange={(e) => {
                    setSkillCategoryFilter(e.target.value);
                    setSkillPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Languages">Languages</option>
                  <option value="Business">Business</option>
                  <option value="Music">Music</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Photography">Photography</option>
                  <option value="Writing">Writing</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : skills.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600">No skills found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <div
                        key={skill._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{skill.title}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  skill.level === "beginner"
                                    ? "bg-green-100 text-green-800"
                                    : skill.level === "intermediate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {skill.level}
                              </span>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md">
                                {skill.category}
                              </span>
                              <span className="text-gray-600">
                                By: {skill.userId?.firstName} {skill.userId?.lastName}
                              </span>
                              <span className="text-gray-500">
                                {new Date(skill.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSkill(skill._id, skill.title)}
                            className="ml-4 text-red-600 hover:text-red-700 p-2"
                            title="Delete skill"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                 
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => setSkillPage((p) => Math.max(1, p - 1))}
                      disabled={skillPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {skillPage} of {skillTotalPages}
                    </span>
                    <button
                      onClick={() => setSkillPage((p) => Math.min(skillTotalPages, p + 1))}
                      disabled={skillPage === skillTotalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}