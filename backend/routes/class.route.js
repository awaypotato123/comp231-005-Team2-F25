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

router.get('/', getClasses);

router.post('/', protect, createClass);

router.get('/user/classes', protect, getUserClasses);
router.get('/instructor', protect, getMyCreatedClasses);

router.get('/:classId', protect, getClassById);
router.put('/:classId', protect, updateClass);
router.delete('/:classId', protect, deleteClass);
router.get('/:classId/students', protect, getClassStudents);
router.put('/:classId/complete', protect, completeClass);

router.post('/join/:classId', protect, joinClass);
router.get('/student/:classId', protect, getClassForStudent);

export default router;