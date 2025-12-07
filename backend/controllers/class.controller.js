import express from 'express';
import Class from '../models/classModel.js';  
import Skill from '../models/Skill.js';  
import User from '../models/User.js';  

const router = express.Router();

// ------------------------------ CREATE CLASS ------------------------------
export const createClass = async (req, res) => {
    try {
        const { title, description, skillId, date, maxStudents } = req.body;
        const userId = req.user.id;

        if (!title || !skillId || !date || !maxStudents) {
            return res.status(400).json({ 
                message: "Missing required fields: title, skillId, date, and maxStudents are required" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userFullName = `${user.firstName} ${user.lastName}`;
        const skill = await Skill.findOne({ _id: skillId, userId });
        
        if (!skill) {
            return res.status(400).json({ message: "Skill not found or does not belong to you" });
        }

        const newClass = new Class({
            title,
            description: description || skill.description,
            skill: skill._id,
            user: userId,
            userName: userFullName,
            date,
            maxStudents: parseInt(maxStudents)
        });

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

        const classData = await Class.findById(classId)
            .populate('skill', 'title category level')
            .populate('students', 'firstName lastName email');
        
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        const isInstructor = classData.user.toString() === userId;
        const isEnrolled = classData.students.some(student => student._id.toString() === userId);

        if (!isInstructor && !isEnrolled) {
            return res.status(403).json({ 
                message: "You are not authorized to view this class. Please request to join first." 
            });
        }

        res.status(200).json(classData);
    } catch (error) {
        console.error("Get class by ID error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------------------ UPDATE CLASS ------------------------------
export const updateClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { title, description, skillId, date, maxStudents } = req.body;
        const userId = req.user.id;

        const skill = await Skill.findOne({ _id: skillId, userId });
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

// ------------------------------ JOIN CLASS WITH PENDING CREDITS ------------------------------
export const joinClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        if (classData.students.includes(userId)) {
            return res.status(400).json({ message: "You have already joined this class" });
        }

        if (classData.students.length >= classData.maxStudents) {
            return res.status(400).json({ message: "Class is full" });
        }

        if (classData.user.toString() === userId) {
            return res.status(400).json({ message: "You cannot join your own class" });
        }

        const student = await User.findById(userId);
        const instructor = await User.findById(classData.user);

        if (!student || !instructor) {
            return res.status(404).json({ message: "User not found" });
        }

        if (student.credits < 1) {
            return res.status(400).json({ 
                message: "Insufficient credits. You need 1 credit to join a class." 
            });
        }

        // Move credit to pending
        student.credits -= 1;
        student.pendingCredits += 1;
        await student.save();

        // Add student to class
        classData.students.push(userId);
        await classData.save();

        res.status(200).json({ 
            message: "Successfully joined the class! 1 credit moved to pending.",
            class: classData,
            studentCredits: {
                available: student.credits,
                pending: student.pendingCredits
            }
        });
    } catch (error) {
        console.error("Join class error:", error);
        res.status(500).json({ message: "Server error while joining the class" });
    }
};

// ------------------------------ COMPLETE CLASS (Transfer Credits) ------------------------------
export const completeClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Only instructor can mark class as complete
        if (classData.user.toString() !== userId) {
            return res.status(403).json({ 
                message: "Only the instructor can mark this class as complete" 
            });
        }

        // Check if already completed
        if (classData.completed) {
            return res.status(400).json({ 
                message: "This class has already been marked as complete" 
            });
        }

        // Transfer credits from all students' pending to instructor
        const instructor = await User.findById(userId);
        const students = await User.find({ _id: { $in: classData.students } });

        let totalCredits = 0;
        for (const student of students) {
            if (student.pendingCredits > 0) {
                student.pendingCredits -= 1;
                await student.save();
                totalCredits += 1;
            }
        }

        // Add credits to instructor
        instructor.credits += totalCredits;
        await instructor.save();

        // Mark class as completed
        classData.completed = true;
        await classData.save();

        res.status(200).json({
            message: `Class completed! You earned ${totalCredits} credit${totalCredits !== 1 ? 's' : ''}.`,
            creditsEarned: totalCredits,
            totalCredits: instructor.credits
        });
    } catch (error) {
        console.error("Complete class error:", error);
        res.status(500).json({ message: "Server error completing class" });
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

        const isEnrolled = classData.students.some(student => student.toString() === studentId); 

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