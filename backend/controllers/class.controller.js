import express from 'express';
import Class from '../models/classModel.js';  
import Skill from '../models/Skill.js';  
import User from '../models/User.js';  

const router = express.Router();

// ------------------------------ CREATE CLASS ------------------------------
export const createClass = async (req, res) => {
    try {
        const { title, description, skillId, date, maxStudents } = req.body;  // Changed skillTitle to skillId
        const userId = req.user.id;

        // Validate required fields
        if (!title || !skillId || !date || !maxStudents) {
            return res.status(400).json({ 
                message: "Missing required fields: title, skillId, date, and maxStudents are required" 
            });
        }

        // Find the user by userId to get their firstName and lastName
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the user's full name
        const userFullName = `${user.firstName} ${user.lastName}`;

        // Find the skill by ID and verify it belongs to the user
        const skill = await Skill.findOne({ _id: skillId, userId });  // Changed to find by _id
        if (!skill) {
            return res.status(400).json({ message: "Skill not found or does not belong to you" });
        }

        // Create a new class with the retrieved information
        const newClass = new Class({
            title,
            description: description || skill.description,
            skill: skill._id,
            user: userId,
            userName: userFullName,
            date,
            maxStudents: parseInt(maxStudents)  // Ensure it's a number
        });

        // Save the new class to the database
        await newClass.save();
        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ------------------------------ GET ALL CLASSES ------------------------------
export const getClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('skill', 'title');

        if (!classes.length) {
            return res.status(404).json({ message: "No classes found" });
        }
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------------------ GET SINGLE CLASS ------------------------------
export const getClassById = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        const classData = await Class.findOne({ _id: classId, user: userId }).populate('skill', 'title');
        if (!classData) return res.status(404).json({ message: "Class not found" });
        
        res.status(200).json(classData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------------------ UPDATE CLASS ------------------------------
export const updateClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { title, description, skillId, date, maxStudents } = req.body;  // Changed skillTitle to skillId
        const userId = req.user.id;

        // Find the skill by ID and userId to make sure it belongs to the current user
        const skill = await Skill.findOne({ _id: skillId, userId });  // Changed to find by _id
        if (!skill) {
            return res.status(400).json({ message: "Skill not found or does not belong to you" });
        }

        const updatedClass = await Class.findOneAndUpdate(
            { _id: classId, user: userId },
            {
                title,
                description: description || skill.description,
                skill: skill._id,
                date,
                maxStudents
            },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found or you don't have permission to update it" });
        }

        res.status(200).json({ message: 'Class updated successfully', class: updatedClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating the class' });
    }
};

// ------------------------------ DELETE CLASS ------------------------------
export const deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        const deletedClass = await Class.findOneAndDelete({ _id: classId, user: userId });
        if (!deletedClass) return res.status(404).json({ message: "Class not found" });

        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------------------ JOIN CLASS ------------------------------ 
export const joinClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        const classData = await Class.findById(classId);
        if (!classData) return res.status(404).json({ message: "Class not found" });

        if (classData.students.includes(userId)) {
            return res.status(400).json({ message: "You have already joined this class" });
        }

        if (classData.students.length >= classData.maxStudents) {
            return res.status(400).json({ message: "Class is full" });
        }

        classData.students.push(userId);
        await classData.save();

        res.status(200).json({ message: "Successfully joined the class", class: classData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while joining the class" });
    }
};

// ------------------------------ GET CLASSES USER IS ENROLLED IN ------------------------------
export const getUserClasses = async (req, res) => {
    try {
        const userId = req.user.id;

        const userClasses = await Class.find({ students: userId });

        if (!userClasses.length) {
            return res.status(404).json({ message: "No classes found for this user" });
        }

        res.status(200).json(userClasses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------------------ GET USER-CREATED CLASSES ------------------------------
export const getMyCreatedClasses = async (req, res) => {
    try {
        const userId = req.user.id;

        const classes = await Class.find({ user: userId })
            .populate('skill', 'title')
            .populate('students', 'firstName lastName email');

        if (!classes.length) {
            return res.status(404).json({ message: "You haven't created any classes yet" });
        }

        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------------------ GET STUDENTS IN A CLASS ------------------------------
export const getClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;

        const classData = await Class.findById(classId).populate('students', 'firstName lastName email');

        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json(classData.students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------------------ GET CLASS FOR STUDENT ------------------------------
export const getClassForStudent = async (req, res) => {
    try {
        const { classId } = req.params;
        const studentId = req.user.id;

        const classData = await Class.findById(classId)
            .populate('user', 'name')
            .select('title date description students user');

        if (!classData) {
            return res.status(404).json({ message: "Class not found." });
        }

        const isEnrolled = classData.students.includes(studentId); 

        if (!isEnrolled) {
            return res.status(403).json({ message: "You are not authorized to view this class." });
        }

        return res.status(200).json({
            id: classData._id,
            title: classData.title,
            description: classData.description,
            date: classData.date,
            instructorName: classData.user.name,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default router;
