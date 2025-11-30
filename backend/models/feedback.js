import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    classId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class',
        required: true
    },
    instructorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  // Referencing the User model (Instructor)
        required: true 
    },
    studentId: {        
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencing the User model (Student)
        required: true, 
    },
    rating: { 
        type: Number, 
        required: true
    },
    comments: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
