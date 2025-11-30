import express from "express";
import ClassPost from "../models/classPost.js";

const router = express.Router();

// GET all posts for a class
router.get("/:classId", async (req, res) => {
  try {
    const posts = await ClassPost.find({ classId: req.params.classId })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a post
router.post("/:classId", async (req, res) => {
  try {
    const { userId, message } = req.body;
    const classId = req.params.classId;

    if (!userId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const post = new ClassPost({
      classId,
      userId,
      message
    });

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REACT to a post
router.post("/react/:postId", async (req, res) => {
  try {
    const { reaction } = req.body;

    const post = await ClassPost.findById(req.params.postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // validate reaction type properly
    if (!(reaction in post.reactions)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    post.reactions[reaction] += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a post
router.delete("/:postId", async (req, res) => {
  try {
    await ClassPost.findByIdAndDelete(req.params.postId);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
