import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { readFileAsDataURL } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, Image as ImageIcon } from "lucide-react";

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  const [editBio, setEditBio] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editGender, setEditGender] = useState("Male");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditBio(user.bio || "");
      setEditUsername(user.username || "");
      setEditGender(user.gender || "Male");
    }
  }, [user]);

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", editBio);
    formData.append("username", editUsername);
    formData.append("gender", editGender);
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        dispatch(setUserProfile(res.data.user));
        toast.success(res.data.message);
        navigate(`/profile/${res.data.user._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 mt-10 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="text-xl font-bold text-gray-800 pb-4 border-b mb-6">
        Edit Profile
      </div>
      <form onSubmit={handleEditProfile} className="flex flex-col gap-6">
        {/* Profile pic section */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-24 h-24 border border-gray-200">
            <AvatarImage src={imagePreview || user?.profilePicture} />
            <AvatarFallback className="text-xl font-bold">
              {user?.username?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={fileChangeHandler}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="text-xs h-8 px-4 rounded-lg flex gap-1.5 items-center bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Change Photo
            </Button>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-700">Username</span>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg p-2.5 focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-transparent outline-none"
            />
          </div>

          {/* Bio textarea */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-700">Bio</span>
            <Textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Write something about yourself..."
              className="text-sm min-h-[100px] border border-gray-200 rounded-lg p-2.5 focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-transparent resize-none"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-700">Gender</span>
            <select
              value={editGender}
              onChange={(e) => setEditGender(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg p-2.5 focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-transparent outline-none bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/profile/${user._id}`)}
              className="rounded-lg h-9 px-4 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0095F6] hover:bg-[#1877F2] text-white rounded-lg h-9 px-6 text-xs font-semibold cursor-pointer min-w-[90px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
    </div>
  );
};

export default EditProfile;
