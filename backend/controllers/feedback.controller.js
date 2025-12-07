import express from 'express';
import Class from '../models/classModel.js';
import User from '../models/User.js';
import Feedback from '../models/feedback.js';

const router = express.Router();

export const submitFeedback = async (req, res) => {
    try {
        const { classId, rating, comments } = req.body;
        const studentId = req.user.id;

        if (!classId || !rating || !comments) {
            return res.status(400).json({ message: "Please provide classId, rating, and comments." });
        }

        const numericRating = parseInt(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
        }

        const classData = await Class.findById(classId).select('students date user');

        if (!classData) {
            return res.status(404).json({ message: "Class not found." });
        }

        const instructorId = classData.user;
        if (!instructorId) {
             return res.status(500).json({ message: "Class data is incomplete: Missing instructor ID." });
        }

        const isEnrolled = classData.students.includes(studentId);
        if (!isEnrolled) {
            return res.status(403).json({ message: "You are not enrolled in this class and cannot submit feedback." });
        }

        const existingFeedback = await Feedback.findOne({ classId, studentId });
        if (existingFeedback) {
            return res.status(400).json({ message: "You have already submitted feedback for this class." });
        }

        const newFeedback = new Feedback({
            classId,
            instructorId,
            studentId,
            rating: numericRating,
            comments,
        });

        await newFeedback.save();

        res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid ID format." });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFeedbackForClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const feedbacks = await Feedback
            .find({ classId })
            .populate('studentId', 'firstName lastName email')
            .populate('instructorId', 'firstName lastName email');

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFeedbackForInstructor = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const feedbacks = await Feedback.find({ instructorId })
            .populate('studentId', 'firstName lastName email')
            .populate('classId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json(feedbacks);

    } catch (error) {
        console.error("Error fetching instructor feedback:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default router;