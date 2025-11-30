import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api'; 
import { useToasts } from "../context/ToastContext"; 

export default function Feedback() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { push } = useToasts();
  
  // State for fetched data and form inputs
  const [classTitle, setClassTitle] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');

  // 1. Fetch Class Title using GET /api/classes/student/:classId
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        // This corresponds to: router.get('/classes/student/:classId', protect, getClassForStudent);
        const response = await api.get(`/classes/student/${classId}`); 
        setClassTitle(response.data.title || 'Unknown Class');

      } catch (error) {
        console.error("Error fetching class details:", error);
        setClassTitle('Error loading class title');
        push("Failed to load class details.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, push]);

  // 2. Submit Feedback using POST /api/feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!rating || !comments) {
        push("Please provide both a rating and comments.", "error");
        return;
    }
    
    // Validate rating is within range before submission
    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        push("Rating must be a number between 1 and 5.", "error");
        return;
    }


    try {
        setIsSubmitting(true); // Set submitting state
        const feedbackData = {
            classId,
            rating: numericRating, // Use the parsed number
            comments,
        };
        
        // Backend route: POST /api/feedbacks
        await api.post(`/feedbacks`, feedbackData);
        
        push(`Feedback successfully submitted for: ${classTitle}`, "success");
        navigate('/classroom'); // Navigate back after successful submission

    } catch (error) {
        console.error("Error submitting feedback:", error);
        push(error.response?.data?.message || "Failed to submit feedback.", "error");
    } finally {
        setIsSubmitting(false); // Clear submitting state
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-lg mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Submit Feedback
      </h2>
      
      <p className="text-gray-600 mb-6">
        {loading ? (
            <span className="animate-pulse">Loading class information...</span>
        ) : (
            <>You are submitting feedback for **{classTitle}**.</>
        )}
      </p>
      
      <form onSubmit={handleSubmitFeedback} className="space-y-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="1"
            max="5"
            required
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="e.g., 5"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            id="comments"
            name="comments"
            rows="4"
            required
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Tell us what you thought about the class..."
            disabled={isSubmitting}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
          disabled={loading || isSubmitting} // Disable if loading class info or submitting
        >
          {loading ? 'Loading...' : isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}