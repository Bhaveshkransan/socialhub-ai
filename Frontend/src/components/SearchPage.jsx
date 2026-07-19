import React, { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search as SearchIcon, Loader2, Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { posts } = useSelector((store) => store.post);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.MODE === 'development' ? (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '' : 'https://socialhub-ai-backend.onrender.com'}//api/v1/user/search?query=${query}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setResults(res.data.users);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by username..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {loading && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {results.length > 0 ? (
          results.map((user) => (
            <div
              key={user._id}
              onClick={() => navigate(`/profile/${user._id}`)}
              className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{user.username}</span>
                <span className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[400px]">
                  {user.bio || "No bio"}
                </span>
              </div>
            </div>
          ))
        ) : query.trim() ? (
          !loading && <div className="p-8 text-center text-gray-500">No users found for "{query}"</div>
        ) : (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800 mb-4 px-2 uppercase tracking-wide">Explore Posts</h2>
            <div className="columns-2 md:columns-3 gap-2 md:gap-4 space-y-2 md:space-y-4">
              {posts && posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/profile/${post.author?._id}`)}
                  className="break-inside-avoid relative rounded-xl overflow-hidden group border border-gray-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.mediaType === "video" ? (
                    <video
                      src={post.image}
                      className="w-full h-auto object-cover block"
                      muted
                      preload="metadata"
                      onMouseOver={(e) => e.target.play()}
                      onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  ) : (
                    <img
                      src={post.image}
                      alt="Explore item"
                      className="w-full h-auto object-cover block"
                    />
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white transition-opacity duration-200">
                    <span className="flex items-center gap-1 font-semibold text-sm">
                      <Heart className="w-4 h-4 fill-white" />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-sm">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
