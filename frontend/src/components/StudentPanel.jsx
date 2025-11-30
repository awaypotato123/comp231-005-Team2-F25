import { useState, useEffect } from "react";
import api from "../lib/api";

export default function StudentPanel({ classId }) {
  const [posts, setPosts] = useState([]);

  // Load posts from backend
  const loadPosts = async () => {
    try {
      const res = await api.get(`/classposts/${classId}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [classId]);

  // Reacting to a post
  const react = async (id, type) => {
    try {
      await api.post(`/classposts/react/${id}`, { reaction: type });
      loadPosts();  // refresh
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 min-h-[480px] flex flex-col">

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Class Announcements
      </h2>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {posts.length === 0 && (
          <p className="text-gray-400 text-center">No announcements yet.</p>
        )}

        {posts.map((post) => {
          const hasReactions =
            post.reactions.like > 0 ||
            post.reactions.heart > 0 ||
            post.reactions.laugh > 0 ||
            post.reactions.wow > 0;

          return (
            <div
              key={post._id}
              className="relative border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <p className="text-gray-900 text-sm leading-relaxed">
                {post.message}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleDateString()} at{" "}
                {new Date(post.createdAt).toLocaleTimeString()} by{" "}
                {post.userId
                  ? `${post.userId.firstName} ${post.userId.lastName}`
                  : "Instructor"}
              </p>

              {hasReactions && (
                <div className="flex gap-4 mt-3 text-lg opacity-80">
                  {post.reactions.like > 0 && <span>👍 {post.reactions.like}</span>}
                  {post.reactions.heart > 0 && <span>❤️ {post.reactions.heart}</span>}
                  {post.reactions.laugh > 0 && <span>😂 {post.reactions.laugh}</span>}
                  {post.reactions.wow > 0 && <span>😮 {post.reactions.wow}</span>}
                </div>
              )}

              {/* Reaction buttons */}
              <div className="flex gap-4 mt-3 text-lg">
                <button onClick={() => react(post._id, "like")} className="hover:scale-110 transition">
                  👍
                </button>

                <button onClick={() => react(post._id, "heart")} className="hover:scale-110 transition">
                  ❤️
                </button>

                <button onClick={() => react(post._id, "laugh")} className="hover:scale-110 transition">
                  😂
                </button>

                <button onClick={() => react(post._id, "wow")} className="hover:scale-110 transition">
                  😮
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
