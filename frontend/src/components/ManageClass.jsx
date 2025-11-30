import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorPanel from "./InstructorPanel";

import api from "../lib/api";

export default function ManageClass() {
    const { classId } = useParams();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
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
                
                {/* LEFT SIDE - CLASS DETAILS */}
                <div className="space-y-8">

                    {/* Header + Stats */}
                    <div className="bg-white shadow rounded-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Class Name: {classData.title}
                        </h1>

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

                        <button
                            onClick={() => navigate(`/edit-class/${classData._id}`)}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Edit This Class
                        </button>
                    </div>

                  {/* Student List */}
{/* Student List */}
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
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Student ID</th>
                    </tr>
                </thead>

                <tbody>
                    {classData.students.map((student, index) => (
                        <tr
                            key={index}
                            className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } border-b hover:bg-blue-50 transition`}
                        >
                            <td className="px-4 py-3 font-medium text-gray-700 border-r">
                                {index + 1}
                            </td>

                            <td className="px-4 py-3 text-gray-800">
                                {student}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}
</div>



                </div>

                {/* RIGHT SIDE - EMPTY FUNCTIONALITY BOX */}
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
