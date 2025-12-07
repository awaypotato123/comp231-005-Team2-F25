import { Router } from "express";
import {
  createBooking,
  getMyBookingsAsLearner,
  getMyBookingsAsTeacher,
  getBookingById,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getBookingStats
} from "../controllers/booking.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All booking routes require authentication
router.use(protect);

// ============================================
// LEARNER ROUTES
// ============================================
// Create a booking (spend 1 credit)
router.post("/", createBooking);

// Get my bookings as learner
router.get("/my-bookings", getMyBookingsAsLearner);

// Cancel a booking (refund credit)
router.put("/:id/cancel", cancelBooking);

// ============================================
// TEACHER ROUTES
// ============================================
// Get booking requests as teacher
router.get("/requests", getMyBookingsAsTeacher);

// Accept a booking request
router.put("/:id/accept", acceptBooking);

// Reject a booking request (refund credit)
router.put("/:id/reject", rejectBooking);

// ============================================
// SHARED ROUTES
// ============================================
// Get single booking details
router.get("/:id", getBookingById);

// Mark booking as completed
router.put("/:id/complete", completeBooking);

// Get booking statistics
router.get("/stats/summary", getBookingStats);

export default router;