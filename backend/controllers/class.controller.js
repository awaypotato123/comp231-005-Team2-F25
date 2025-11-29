import express from 'express';  // Make sure express is imported
import Class from '../models/classModel.js';  
import Skill from '../models/Skill.js';  
import User from '../models/User.js';  

const router = express.Router();  // Define the router here

// ------------------------------ CREATE CLASS ------------------------------
export const createClass = async (req, res) => {
    try {
        const { title, description, skillTitle, date, maxStudents } = req.body;
        const userId = req.user.id;  // Get the user ID from the JWT (populated by the protect middleware)

        // Find the user by userId to get their firstName and lastName
        const user = await User.findById(userId);  // Find user by ID in the User collection
        if (!user) {
            return res.status(404).json({ message: "User not found" });  // Handle case where user doesn't exist
        }

        // Create the user's full name
        const userFullName = `${user.firstName} ${user.lastName}`;

        // Find the skill by title and userId
        const skill = await Skill.findOne({ title: skillTitle, userId });
        if (!skill) return res.status(400).json({ message: "Skill not found" });

        // Create a new class with the retrieved information
        const newClass = new Class({
            title,
            description: description || skill.description,  // Default to skill description if not provided
            skill: skill._id,
            user: userId,  // Store userId in class
            userName: userFullName,  // Store the full name of the user
            date,
            maxStudents
        });

        // Save the new class to the database
        await newClass.save();
        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------------------ GET ALL CLASSES ------------------------------
export const getClasses = async (req, res) => {
    try {
        // Fetch all classes, no need for filtering by userId
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
        const { classId } = req.params;  // Get class ID from route parameters
        const userId = req.user.id;  // Get user ID from req.user (set by protect middleware)

        // Find the class by ID and user
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
        const { classId } = req.params;  // Get class ID from route parameters
        const { title, description, skillTitle, date, maxStudents } = req.body;
        const userId = req.user.id;  // Get user ID from req.user (set by protect middleware)

        // Find the skill by title and userId to make sure it belongs to the current user
        const skill = await Skill.findOne({ title: skillTitle, userId });
        if (!skill) {
            return res.status(400).json({ message: "Skill not found or does not belong to you" });
        }

        // Update the class with the new data
        const updatedClass = await Class.findOneAndUpdate(
            { _id: classId, user: userId },  // Ensure the class belongs to the current user
            {
                title,
                description: description || skill.description,  // Default to the skill's description if not provided
                skill: skill._id,  // Update with the skill ID
                date,
                maxStudents
            },
            { new: true }  // Return the updated class
        );

        // If the class is not found or the user doesn't own it, return an error
        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found or you don't have permission to update it" });
        }

        // Return the updated class
        res.status(200).json({ message: 'Class updated successfully', class: updatedClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating the class' });
    }
};

// ------------------------------ DELETE CLASS ------------------------------
export const deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;  // Get class ID from route parameters
        const userId = req.user.id;  // Get user ID from req.user (set by protect middleware)

        // Find and delete the class by ID and user
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
        const userId = req.user.id; // Get the user ID from JWT

        // Find the class by ID
        const classData = await Class.findById(classId);
        if (!classData) return res.status(404).json({ message: "Class not found" });

        // Check if the user is already in the class
        if (classData.students.includes(userId)) {
            return res.status(400).json({ message: "You have already joined this class" });
        }

        // Check if class is full
        if (classData.students.length >= classData.maxStudents) {
            return res.status(400).json({ message: "Class is full" });
        }

        // Add user to the class
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
        const userId = req.user.id; // Get the user ID from JWT

        // Find all classes where the user is enrolled
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
        const userId = req.user.id; // Logged-in user ID

        // Find classes created by this user
        const classes = await Class.find({ user: userId })
            .populate('skill', 'title')   // optional
            .populate('students', 'firstName lastName email'); // optional

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

        // Find the class and populate the students field
        const classData = await Class.findById(classId).populate('students', 'firstName lastName email');

        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json(classData.students); // Return the list of students
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



export default router;
