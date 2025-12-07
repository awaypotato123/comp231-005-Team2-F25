import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorPanel from "./InstructorPanel";
import api from "../lib/api";

export default function ManageClass() {
    const { classId } = useParams();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const navigate = useNavigate();

    const fetchClass = async () => {
        try {
            const res = await api.get(`/classes/${classId}`);
            setClassData(res.data);
            console.log(res.data);
        } catch (error) {
            console.error("Error loading class details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClass();
    }, [classId]);

    const handleCompleteClass = async () => {
        if (!window.confirm("Mark this class as complete? This will transfer credits from students to you.")) {
            return;
        }

        try {
            setCompleting(true);
            const response = await api.put(`/classes/${classId}/complete`);
            
            alert(response.data.message);
            
            fetchClass();

            const userRes = await api.get('/users/me');
            
        } catch (error) {
            console.error("Error completing class:", error);
            alert(error.response?.data?.message || "Failed to mark class as complete");
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-600 text-lg">Class not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                <div className="space-y-8">

                    <div className="bg-white shadow rounded-xl p-8">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {classData.title}
                                </h1>
                                {classData.completed && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        ✓ Completed
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                            <div className="p-5 bg-blue-100 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="text-2xl font-semibold text-blue-700 mt-1">
                                    {new Date(classData.date).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="p-5 bg-green-100 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-600">Max Students</p>
                                <p className="text-2xl font-semibold text-green-700 mt-1">
                                    {classData.maxStudents}
                                </p>
                            </div>

                            <div className="p-5 bg-yellow-100 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-600">Students Joined</p>
                                <p className="text-2xl font-semibold text-yellow-700 mt-1">
                                    {classData.students?.length || 0}
                                </p>
                            </div>

                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => navigate(`/edit-class/${classData._id}`)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                Edit This Class
                            </button>

                            {!classData.completed && classData.students?.length > 0 && (
                                <button
                                    onClick={handleCompleteClass}
                                    disabled={completing}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {completing ? 'Completing...' : '✓ Mark Complete & Earn Credits'}
                                </button>
                            )}
                        </div>

                        {classData.completed && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">
                                    ✓ This class has been completed. Credits have been transferred.
                                </p>
                            </div>
                        )}

                        {!classData.completed && classData.students?.length === 0 && (
                            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-gray-600 text-sm">
                                    💡 You can mark the class as complete once students join.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow rounded-xl p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Students Enrolled</h2>

                        {classData.students?.length === 0 ? (
                            <p className="text-gray-500">No students enrolled yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-700 border-r">#</th>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-700 border-r">Name</th>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {classData.students.map((student, index) => {
                                            const isPopulated = typeof student === 'object' && student !== null;
                                            const studentName = isPopulated 
                                                ? `${student.firstName} ${student.lastName}` 
                                                : 'Unknown';
                                            const studentEmail = isPopulated 
                                                ? student.email 
                                                : student;

                                            return (
                                                <tr
                                                    key={isPopulated ? student._id : student}
                                                    className={`${
                                                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                    } border-b hover:bg-blue-50 transition`}
                                                >
                                                    <td className="px-4 py-3 font-medium text-gray-700 border-r">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-4 py-3 text-gray-800 border-r">
                                                        {studentName}
                                                    </td>

                                                    <td className="px-4 py-3 text-gray-600">
                                                        {studentEmail}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>

                <div className="space-y-8">
                    <div className="space-y-8">
                        <InstructorPanel 
                            classId={classId}
                            userId={classData.user}
                        />
                    </div>
                    <div className="bg-white shadow-lg rounded-xl p-8 min-h-[400px]">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Class Tools
                        </h2>

                        <div className="mt-6 h-64 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Coming Soon</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}