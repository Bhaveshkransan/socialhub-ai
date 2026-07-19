import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommentDialog = ({ open, setOpen, post }) => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);

  const sendMessageHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `/api/v1/post/${post?._id}/comment`,
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
          p._id === post._id ? { ...p, comments: updatedComments } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-xl sm:max-w-[900px] w-full h-[75vh] max-h-[600px] md:max-h-[700px] bg-white border border-gray-100 shadow-2xl">
        <div className="flex w-full h-full items-stretch">
          {/* LEFT IMAGE - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex w-[60%] bg-neutral-950 items-center justify-center overflow-hidden h-full">
            <img
              src={post?.image}
              alt="Post image"
              className="w-full h-full object-contain"
            />
          </div>

          {/* RIGHT COMMENTS PANE - Full width on mobile, 40% on desktop */}
          <div className="w-full md:w-[40%] flex flex-col bg-white h-full border-l border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <Avatar className="w-9 h-9">
                <AvatarImage src={post?.author?.profilePicture} />
                <AvatarFallback>
                  {post?.author?.username?.substring(0, 2).toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm text-gray-800 leading-normal">{post?.author?.username}</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MoreHorizontal className="cursor-pointer ml-auto text-gray-500 hover:text-gray-800" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">Unfollow</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Add to Favourites</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Comments Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 leading-relaxed">
              {/* Post Caption as first item in comments list (Instagram style) */}
              {post?.caption && (
                <div className="flex gap-3 items-start pb-4 border-b border-gray-50">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={post?.author?.profilePicture} />
                    <AvatarFallback>
                      {post?.author?.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm leading-5 text-gray-800">
                      <span className="font-semibold mr-2 text-gray-900">{post?.author?.username}</span>
                      {post.caption}
                    </p>
                  </div>
                </div>
              )}

              {post?.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => {
                  const isPostAuthor = comment.author?._id?.toString() === post?.author?._id?.toString() || comment.author?.toString() === post?.author?._id?.toString();
                  return (
                    <div key={comment._id} className="flex gap-3 items-start">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={comment.author?.profilePicture} />
                        <AvatarFallback>
                          {comment.author?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0">
                        <p className="text-sm leading-5 text-gray-800">
                          <span className="font-semibold text-gray-900 mr-1.5 inline-flex items-center">
                            {comment.author?.username}
                            {isPostAuthor && (
                              <span className="bg-neutral-100 text-neutral-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-1 select-none leading-none border border-neutral-200/50">
                                Author
                              </span>
                            )}
                          </span>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 text-sm py-10">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Bottom Input Area */}
            <div className="border-t border-gray-100 p-4 flex gap-2 items-center mt-auto flex-shrink-0">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                type="text"
                placeholder="Add a comment..."
                className="outline-none text-sm flex-grow pr-4 text-gray-700 placeholder:text-gray-400 bg-transparent py-1 leading-normal"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) {
                    sendMessageHandler();
                  }
                }}
              />
              <Button
                disabled={!text.trim()}
                onClick={sendMessageHandler}
                variant="ghost"
                className="text-[#0095F6] hover:text-[#1877F2] font-semibold text-sm cursor-pointer disabled:opacity-40 h-auto p-0"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
