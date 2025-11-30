import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StudentPanel from "./StudentPanel";
import api from "../lib/api";

export default function EnterClass() {
    const { classId } = useParams();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchClass = async () => {
        try {
            const res = await api.get(`/classes/${classId}`);
            setClassData(res.data);
        } catch (error) {
            console.error("Error loading class:", error);
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
                <p className="text-gray-600 text-lg">Class not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* LEFT SIDE */}
                <div className="space-y-8">

                    {/* Header and stats */}
                    <div className="bg-white shadow rounded-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                           Class Name: {classData.title}
                        </h1>

                        <p className="text-gray-600 mt-1 text-2xl">
                            By: {classData.userName}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                            {/* Date */}
                            <div className="p-5 bg-blue-100 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="text-2xl font-semibold text-blue-700 mt-1">
                                    {new Date(classData.date).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Capacity */}
                            <div className="p-5 bg-green-100 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-600">Student Limit</p>
                                <p className="text-2xl font-semibold text-green-700 mt-1">
                                    {classData.maxStudents}
                                </p>
                            </div>

                            {/* Joined */}
                            <div className="p-5 bg-yellow-100 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-600">Students Joined</p>
                                <p className="text-2xl font-semibold text-yellow-700 mt-1">
                                    {classData.students?.length || 0}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white shadow rounded-xl p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">About This Class</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {classData.description}
                        </p>
                    </div>

                    {/* Skill */}
                    <div className="bg-white shadow rounded-xl p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Skill Focus</h2>
                        <p className="text-gray-700">
                            {classData.skill?.title}
                        </p>
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-8">
                    <div className="space-y-8">
  <StudentPanel classId={classId} />
</div>
                    <div className="bg-white shadow-lg rounded-xl p-8 min-h-[400px]">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Student Tools
                        </h2>
                        <p className="text-gray-500">
                            This area will hold class resources, attendance, discussion, and more.
                        </p>

                        <div className="mt-6 h-64 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Coming Soon</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
