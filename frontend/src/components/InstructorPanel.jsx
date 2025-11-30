import { useState, useEffect } from "react";
import api from "../lib/api";

export default function InstructorPanel({ classId, userId }) {
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);

  // load posts from backend
  const loadPosts = async () => {
    try {
      const res = await api.get(`/classposts/${classId}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to load posts:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [classId]);

  // send a post to backend
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const res = await api.post(`/classposts/${classId}`, {
        userId,
        message
      });

      setPosts((prev) => [res.data, ...prev]);
      setMessage("");
    } catch (err) {
      console.error("Failed to send post:", err);
    }
  };

  // delete a post in backend
  const handleDelete = async (id) => {
    try {
      await api.delete(`/classposts/delete/${id}`);
      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 min-h-[480px] flex flex-col">

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Instructor Board
      </h2>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {posts.length === 0 && (
          <p className="text-gray-400 text-center">
            No messages yet. Start the discussion in the class.
          </p>
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
              {/* delete button */}
              <button
                onClick={() => handleDelete(post._id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>

              {/* message */}
              <p className="text-gray-900 text-sm leading-relaxed">
                {post.message}
              </p>

              {/* timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleDateString()} at{" "}
                {new Date(post.createdAt).toLocaleTimeString()}
              </p>

              {/* reaction bar */}
              {hasReactions && (
                <div className="flex gap-4 mt-3 text-lg opacity-60 pointer-events-none select-none">
                  {post.reactions.like > 0 && <span>👍 {post.reactions.like}</span>}
                  {post.reactions.heart > 0 && <span>❤️ {post.reactions.heart}</span>}
                  {post.reactions.laugh > 0 && <span>😂 {post.reactions.laugh}</span>}
                  {post.reactions.wow > 0 && <span>😮 {post.reactions.wow}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="mt-4 border-t pt-4">
        <textarea
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          rows="2"
          placeholder="Write an announcement to the class"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={handleSend}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition w-full"
        >
          Send a Message
        </button>
      </div>
    </div>
  );
}
