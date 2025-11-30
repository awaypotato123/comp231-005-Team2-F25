import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SkillForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skill, setSkill] = useState('');
    const [instructor, setInstructor] = useState('');
    const [date, setDate] = useState('');
    const [maxStudents, setMaxStudents] = useState('');
    const [skills, setSkills] = useState([]);
    const [instructors, setInstructors] = useState([]);

    // Fetch skills and instructors from the backend
    useEffect(() => {
        async function fetchData() {
            try {
                const skillResponse = await axios.get('/api/skills');
                const instructorResponse = await axios.get('/api/users');
                setSkills(skillResponse.data);
                setInstructors(instructorResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/classes/create', {
                title,
                description,
                skillId: skill,
                instructorId: instructor,
                date,
                maxStudents
            });

            // Display success message
            alert(response.data.message);
            // Optionally reset the form fields after successful submission
            setTitle('');
            setDescription('');
            setSkill('');
            setInstructor('');
            setDate('');
            setMaxStudents('');
        } catch (error) {
            alert("Error creating class.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div>
                <label>Skill</label>
                <select onChange={(e) => setSkill(e.target.value)} required>
                    <option value="">Select Skill</option>
                    {skills.map((skill) => (
                        <option key={skill._id} value={skill._id}>{skill.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Instructor</label>
                <select onChange={(e) => setInstructor(e.target.value)} required>
                    <option value="">Select Instructor</option>
                    {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id}>{instructor.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Date</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
                <label>Max Students</label>
                <input type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} required />
            </div>
            <button type="submit">Create Class</button>
        </form>
    );
};

export default ClassForm;
