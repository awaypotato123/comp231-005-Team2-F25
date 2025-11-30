import express from 'express'; 
import {
  submitFeedback,
  getFeedbackForClass,
  getFeedbackForInstructor
} from '../controllers/feedback.controller.js';

const router = express.Router();

router.post('/', submitFeedback);
router.get('/class/:classId', getFeedbackForClass);
router.get('/instructor', getFeedbackForInstructor);

export default router;
