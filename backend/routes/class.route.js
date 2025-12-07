import express from 'express';
import { 
    createClass, 
    getClasses, 
    getClassById, 
    updateClass, 
    deleteClass, 
    joinClass,
    completeClass,
    getUserClasses, 
    getMyCreatedClasses, 
    getClassStudents,
    getClassForStudent
} from '../controllers/class.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getClasses);

// Protected routes
router.post('/', protect, createClass);

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes!
// Put all /specific-name routes before /:classId

router.get('/user/classes', protect, getUserClasses);
router.get('/instructor', protect, getMyCreatedClasses);  // ✅ BEFORE /:classId

// Parameterized routes (with :classId) come AFTER specific routes
router.get('/:classId', protect, getClassById);
router.put('/:classId', protect, updateClass);
router.delete('/:classId', protect, deleteClass);
router.get('/:classId/students', protect, getClassStudents);
router.put('/:classId/complete', protect, completeClass);

// Routes with :classId in the middle
router.post('/join/:classId', protect, joinClass);
router.get('/student/:classId', protect, getClassForStudent);

export default router;