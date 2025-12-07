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

router.use(protect);

router.post("/", createBooking);

router.get("/my-bookings", getMyBookingsAsLearner);

router.put("/:id/cancel", cancelBooking);

router.get("/requests", getMyBookingsAsTeacher);

router.put("/:id/accept", acceptBooking);

router.put("/:id/reject", rejectBooking);

router.get("/:id", getBookingById);

router.put("/:id/complete", completeBooking);

router.get("/stats/summary", getBookingStats);

export default router;