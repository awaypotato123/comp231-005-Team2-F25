import express from 'express';
import { 
  createClass, 
  getClasses, 
  getClassById, 
  updateClass, 
  deleteClass, 
  joinClass, 
  getUserClasses, 
  getClassStudents,
  getMyCreatedClasses
} from '../controllers/class.controller.js';  // Import the class controller methods
import { protect } from '../middleware/auth.middleware.js';  // Import the authentication middleware

const router = express.Router();

// POST: Create a new class (authentication required)
router.post('/create', protect, createClass);  

// GET: Get all classes (authentication required)
router.get('/', getClasses);

//GET: Get all classes the user has created
router.get('/instructor', protect, getMyCreatedClasses);

// GET: Get a single class by classId (authentication required)
router.get('/:classId', protect, getClassById); 

// PUT: Update a class by classId (authentication required)
router.put('/:classId', protect, updateClass); 

// DELETE: Delete a class by classId (authentication required)
router.delete('/:classId', protect, deleteClass);

// POST: Join a class (authentication required)
router.post('/join/:classId', protect, joinClass);  // New route for joining a class

// GET: Get all classes the user is enrolled in (authentication required)
router.get('/user/classes', protect, getUserClasses);  // Get the classes a user has joined

// GET: Get all students in a class (authentication required)
router.get('/:classId/students', protect, getClassStudents);  // Get the students in a specific class



export default router;
