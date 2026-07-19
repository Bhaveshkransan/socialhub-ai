import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, Image as ImageIcon, Video, X } from "lucide-react";

import { readFileAsDataURL } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [imagePreview, setImagePreview] = useState("");
  const [fileType, setFileType] = useState("image"); // "image" or "video"
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setFile(file);
      const isVid = file.type.startsWith("video/");
      setFileType(isVid ? "video" : "image");
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const discardImageHandler = () => {
    setFile("");
    setImagePreview("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const resetForm = () => {
    setCaption("");
    setFile("");
    setImagePreview("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    setOpen(false);
  };

  const postHandler = async (e) => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);
    formData.append("visibility", visibility);

    try {
      setLoading(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-5 flex flex-col gap-4 bg-white border border-gray-100 shadow-xl rounded-xl">
          <DialogHeader className="text-center font-bold text-base pb-3 border-b border-gray-100 text-gray-800">
            Create New Post
          </DialogHeader>

          <div className="flex gap-3 items-center">
            <Avatar className="w-10 h-10 border border-gray-100 rounded-full overflow-hidden">
              <AvatarImage src={user?.profilePicture}></AvatarImage>
              <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold flex items-center justify-center w-full h-full">
                CN
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="font-semibold text-sm text-gray-800">
                {user?.username}
              </h1>
              <span className="text-xs text-gray-400">{user?.bio || "No bio yet..."}</span>
            </div>
          </div>

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="focus-visible:ring-0 focus-visible:border-transparent border-0 p-0 text-sm placeholder:text-gray-400 text-gray-700 resize-none min-h-[100px] w-full"
            placeholder="Write a caption..."
          />

          <div className="flex items-center justify-between px-4 mt-2">
            <span className="text-sm font-semibold text-gray-700">Audience</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="public">Public</option>
              <option value="close_friends">Close Friends</option>
            </select>
          </div>

          {/* Hidden File Input */}
          <input
            onChange={fileChangeHandler}
            ref={imageRef}
            type="file"
            accept="image/*, video/*"
            className="hidden"
          />

          {imagePreview ? (
            /* Selected Image/Video Preview */
            <div className="w-full h-64 flex items-center justify-center relative bg-black rounded-lg overflow-hidden border border-gray-100">
              {fileType === "video" ? (
                <video src={imagePreview} controls className="w-full h-full object-contain" />
              ) : (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              )}
              <button
                onClick={discardImageHandler}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer z-10"
                title="Discard file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Instagram-like Select Device Area */
            <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50/50">
              <div className="flex gap-2">
                <ImageIcon className="w-12 h-12 text-gray-400 stroke-[1.25]" />
                <Video className="w-12 h-12 text-gray-400 stroke-[1.25]" />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Select a photo or video to upload from your device (Max 50MB)
              </p>
              <Button
                onClick={() => imageRef.current.click()}
                className="bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#1062de] text-white font-semibold rounded-lg px-4 h-9 text-xs cursor-pointer shadow-xs transition-colors w-full"
              >
                Select from Local device
              </Button>
            </div>
          )}

          {imagePreview &&
            (loading ? (
              <Button disabled className="w-full mt-2">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Please wait
              </Button>
            ) : (
              <Button
                onClick={postHandler}
                type="submit"
                className="bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#1062de] text-white font-semibold rounded-lg px-4 h-9 text-xs cursor-pointer shadow-xs transition-colors w-full mt-2"
              >
                Post
              </Button>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
