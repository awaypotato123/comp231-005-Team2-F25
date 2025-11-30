import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    skill: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Skill',  // Referencing the Skill model
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  // Referencing the User model (Instructor)
        required: true 
    },
    userName: {
        type: String, 
    },
    date: { 
        type: Date, 
        required: true 
    },
    maxStudents: { 
        type: Number, 
        required: true 
    },
    students: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [], 
    }]
}, { timestamps: true });  // Automatically adds createdAt and updatedAt

const Class = mongoose.model('Class', classSchema);

export default Class;
