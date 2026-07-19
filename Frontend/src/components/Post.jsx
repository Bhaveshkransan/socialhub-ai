import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageCircle, MoreHorizontal, Send, Bookmark } from "lucide-react";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa6";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts } from "@/redux/postSlice";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const disptach = useDispatch();
  const postRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post._id}/view`, {}, { withCredentials: true })
            .catch(err => console.log("Failed to record view", err));
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => observer.disconnect();
  }, [post._id]);

  const isLiked = post.likes?.includes(user?._id) || false;
  const likeCount = post.likes?.length || 0;
  const isPostAuthor = user && user?._id === post?.author?._id;
  const isBookmarked = user?.bookmarks?.includes(post?._id) || false;

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post?._id}/bookmark`, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        
        // Update local user bookmarks array
        const updatedBookmarks = isBookmarked 
          ? user.bookmarks.filter(id => id !== post?._id)
          : [...(user?.bookmarks || []), post?._id];
          
        import("@/redux/authSlice").then(({ setAuthUser }) => {
          disptach(setAuthUser({ ...user, bookmarks: updatedBookmarks }));
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to bookmark");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = isLiked ? "dislike" : "like";
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = isLiked
          ? post.likes.filter((id) => id !== user?._id)
          : [...(post.likes || []), user?._id];

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, likes: updatedLikes } : p
        );
        disptach(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const commentHandler = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post?._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedComments = [res.data.comment, ...(post.comments || [])];
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? { ...p, comments: updatedComments }
            : p
        );
        disptach(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteHandler = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/post/delete/${post?._id}`,
        { withCredentials: true },
      );
      const updatedPostData = posts.filter(
        (postItem) => postItem?._id !== post?._id,
      );
      disptach(setPosts(updatedPostData))
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div 
      ref={postRef} 
      className={`my-8 w-full max-w-[550px] mx-auto bg-white rounded-3xl overflow-hidden border ${post.visibility === 'close_friends' ? 'border-green-400 shadow-green-100/50 ring-2 ring-green-100' : 'border-gray-100'} shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-[2px] bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 rounded-full flex items-center justify-center shrink-0">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={post.author?.profilePicture} />
              <AvatarFallback className="font-bold text-sm">
                {post.author?.username?.substring(0, 2).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-sm text-neutral-900">{post.author?.username}</h1>
              {isPostAuthor && (
                <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full select-none leading-none border border-indigo-200/60">
                  Author
                </span>
              )}
              {post.visibility === 'close_friends' && (
                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full select-none flex items-center gap-1 border border-green-200 leading-none">
                  ⭐️ Close Friends
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">2 minutes ago</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger>
            <MoreHorizontal className="cursor-pointer hover:text-gray-600 transition" />
          </DialogTrigger>

          <DialogContent className="flex flex-col p-0 max-w-sm">
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  className="w-full rounded-none py-6 cursor-pointer"
                >
                  Add to favourites
                </Button>
              }
            />

            <DialogClose
              render={
                <Button
                  variant="ghost"
                  className="w-full rounded-none py-6 text-red-500 font-semibold cursor-pointer"
                >
                  Unfollow
                </Button>
              }
            />

            <DialogClose
              render={
                user &&
                user?._id === post?.author._id && (
                  <Button
                    variant="ghost"
                    className="w-full rounded-none py-6 cursor-pointer"
                    onClick={deleteHandler}
                  >
                    Delete
                  </Button>
                )
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Media — no forced square, show full media naturally */}
      {post.mediaType === "video" ? (
        <video
          src={post.image}
          controls
          className="w-full object-cover max-h-[600px] bg-black"
        />
      ) : (
        <img
          src={post.image}
          alt="post"
          className="w-full object-cover max-h-[600px]"
        />
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isLiked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={26}
              className="cursor-pointer text-red-500 hover:text-red-600 transition-all duration-200 transform hover:scale-110 active:scale-90"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={26}
              className="cursor-pointer text-neutral-800 hover:text-neutral-500 transition-all duration-200 transform hover:scale-110 active:scale-90"
            />
          )}

          <MessageCircle
            onClick={() => setOpen(true)}
            size={26}
            className="cursor-pointer text-neutral-800 hover:text-neutral-500 transition-all duration-200 transform hover:scale-110 active:scale-90"
          />

          <Send
            size={26}
            className="cursor-pointer text-neutral-800 hover:text-neutral-500 transition-all duration-200 transform hover:scale-110 active:scale-90"
          />
        </div>

        {isBookmarked ? (
          <FaBookmark
            onClick={bookmarkHandler}
            size={24}
            className="cursor-pointer text-black hover:text-neutral-500 transition-all duration-200 transform hover:scale-110 active:scale-90"
          />
        ) : (
          <FaRegBookmark
            onClick={bookmarkHandler}
            size={24}
            className="cursor-pointer text-neutral-800 hover:text-neutral-500 transition-all duration-200 transform hover:scale-110 active:scale-90"
          />
        )}
      </div>

      <div className="px-4 pb-1">
      <div className="font-bold text-sm text-neutral-900 block mt-1 flex gap-4">
        <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        <span>{post.viewedBy?.length || 0} views</span>
      </div>
      <p className="text-sm mt-1.5 leading-relaxed">
        <span className="font-semibold text-neutral-900 mr-1">{post.author?.username}</span>
        <span className="text-neutral-700">{post.caption}</span>
      </p>
      {post.comments && post.comments.length > 0 && (
        <span
          className="cursor-pointer text-neutral-400 hover:text-neutral-600 text-xs mt-1.5 block select-none transition-colors duration-200"
          onClick={() => setOpen(true)}
        >
          View all {post.comments.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} post={post} />

      <form onSubmit={commentHandler} className="flex items-center gap-3 border-t border-neutral-100 mt-3 pt-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="outline-none text-sm flex-1 text-neutral-700 placeholder:text-neutral-400 bg-transparent leading-normal"
        />
        {text.trim() && (
          <button
            type="submit"
            className="text-[#0095F6] hover:text-[#1877F2] font-semibold text-sm cursor-pointer select-none active:scale-95 transition-all duration-200 shrink-0"
          >
            Post
          </button>
        )}
      </form>
      </div>
    </div>
  );
};

export default Post;
