import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";
import { setAuthUser } from "@/redux/authSlice";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const Rightsidebar = () => {
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingIds, setLoadingIds] = useState({});
  
  useGetSuggestedUsers(user);


  const followOrUnfollowHandler = async (targetId) => {
    const isFollowing = user?.following?.includes(targetId);
    try {
      setLoadingIds((prev) => ({ ...prev, [targetId]: true }));
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/followOrUnfollow/${targetId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedFollowing = isFollowing
          ? user.following.filter((id) => id !== targetId)
          : [...(user.following || []), targetId];
        
        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoadingIds((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  if (!user) return null;

  return (
    <div className="w-full sticky top-8 pt-6 px-4 lg:px-6">
      {/* Logged in User Profile Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
          <Avatar className="w-11 h-11 border border-neutral-100 shadow-xs hover:scale-105 transition-transform duration-200">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="font-bold text-sm bg-neutral-100 text-neutral-600">
              {user.username?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-neutral-800 truncate">{user.username}</span>
            <span className="text-xs text-neutral-400 truncate">{user.email}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/profile/${user._id}`)}
          className="ml-auto text-[#0095F6] hover:text-[#1877F2] font-semibold text-xs cursor-pointer select-none active:scale-95 transition-transform shrink-0"
        >
          Profile
        </button>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide select-none">Suggested for you</span>
        <button className="ml-auto text-xs font-semibold text-neutral-800 hover:text-neutral-500 cursor-pointer select-none">
          See All
        </button>
      </div>

      {/* Suggestions List */}
      <div className="flex flex-col gap-4">
        {(suggestedUsers || []).length > 0 ? (
          (suggestedUsers || [])
            .filter((sUser) => sUser._id !== user?._id)
            .slice(0, 5)
            .map((sUser) => {
            const isFollowing = user?.following?.includes(sUser._id);
            const isLoading = loadingIds[sUser._id];

            return (
              <div key={sUser._id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => navigate(`/profile/${sUser._id}`)}>
                  <Avatar className="w-9 h-9 border border-neutral-100 hover:scale-105 transition-transform duration-200 shrink-0">
                    <AvatarImage src={sUser.profilePicture} />
                    <AvatarFallback className="font-semibold text-xs bg-neutral-100 text-neutral-600">
                      {sUser.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-neutral-800 truncate">{sUser.username}</span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {sUser.mutualConnections?.length > 0 
                        ? `Followed by ${sUser.mutualConnections[0]}${sUser.mutualConnections.length > 1 ? ` + ${sUser.mutualConnections.length - 1} more` : ''}` 
                        : "Suggested for you"}
                    </span>
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() => followOrUnfollowHandler(sUser._id)}
                  className={`ml-auto font-semibold text-xs select-none cursor-pointer active:scale-95 transition-transform shrink-0 ${
                    isFollowing ? "text-neutral-500 hover:text-neutral-800" : "text-[#0095F6] hover:text-[#1877F2]"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-neutral-400" />
                  ) : isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })
        ) : (
          <span className="text-xs text-neutral-400 select-none py-2 text-center">
            No suggestions available
          </span>
        )}
      </div>
    </div>
  );
};

export default Rightsidebar;
