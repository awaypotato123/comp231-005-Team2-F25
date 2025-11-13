import Skill from "../models/Skill.js";
import User from "../models/User.js";

export const search = async (req, res) => {
    try {
        const query = req.query.query;
        const category = req.query.category;

        const skillFilter = {
            name: { $regex: query, $options: "i"}
        }

        if (category)
            skillFilter.category = category;

        const skills = await Skill.find(skillFilter);
        const user = await User.find({ name: { $regex: query, $options: "i" } });

        res.json({ skills, user });
    }
    catch (err) {
        console.error("Error fetching results: ", err);
        res.status(500).json({ message: "Server error fetching results"});
    }
}