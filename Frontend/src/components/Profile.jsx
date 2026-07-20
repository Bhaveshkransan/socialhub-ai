import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Heart, MessageCircle, Settings, Grid, Bookmark as BookmarkIcon, Loader2, Star, Users } from "lucide-react";
import { toast } from "sonner";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { useNavigate } from "react-router-dom";
import { setAuthUser, addConnection } from "@/redux/authSlice";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: loggedInUser, userProfile: profileUser } = useSelector((store) => store.auth);
  
  const { fetchUserProfile } = useGetUserProfile(id);
  
  const [activeTab, setActiveTab] = useState("posts");
  const [closeFriendsOpen, setCloseFriendsOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);

  const followOrUnfollowHandler = async () => {
    try {
      const res = await axios.get(
        `/api/v1/user/followOrUnfollow/${profileUser?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUserProfile();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const toggleCloseFriendHandler = async () => {
    try {
      const res = await axios.post(
        `/api/v1/user/closefriend/${profileUser?._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        // Update local Redux state
        const isCurrentlyCF = loggedInUser.closeFriends?.includes(profileUser?._id);
        const updatedCloseFriends = isCurrentlyCF
          ? loggedInUser.closeFriends.filter(id => id !== profileUser?._id)
          : [...(loggedInUser.closeFriends || []), profileUser?._id];
        
        dispatch(setAuthUser({
          ...loggedInUser,
          closeFriends: updatedCloseFriends
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const connectionActionHandler = async (action) => {
    try {
      let url = "";
      if (action === "send") url = `/api/v1/user/connection-request/${profileUser?._id}`;
      else if (action === "accept") url = `/api/v1/user/connection-request/${profileUser?._id}/accept`;
      else if (action === "reject" || action === "cancel") url = `/api/v1/user/connection-request/${profileUser?._id}/reject`;
      else if (action === "remove") url = `/api/v1/user/connection/remove/${profileUser?._id}`;

      const res = await axios.post(url, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        
        if (action === "accept") {
          dispatch(addConnection({
            _id: profileUser._id,
            username: profileUser.username,
            profilePicture: profileUser.profilePicture
          }));
        }

        fetchUserProfile();
        
        // Optimistically update loggedInUser state
        let updatedUser = { ...loggedInUser };
        if (action === "send") {
          updatedUser.sentConnectionRequests = [...(updatedUser.sentConnectionRequests || []), profileUser?._id];
        } else if (action === "accept") {
          updatedUser.connections = [...(updatedUser.connections || []), profileUser?._id];
          updatedUser.receivedConnectionRequests = (updatedUser.receivedConnectionRequests || []).filter(id => id !== profileUser?._id);
        } else if (action === "reject" || action === "cancel") {
          updatedUser.sentConnectionRequests = (updatedUser.sentConnectionRequests || []).filter(id => id !== profileUser?._id);
          updatedUser.receivedConnectionRequests = (updatedUser.receivedConnectionRequests || []).filter(id => id !== profileUser?._id);
        } else if (action === "remove") {
          updatedUser.connections = (updatedUser.connections || []).filter(id => id !== profileUser?._id);
        }
        dispatch(setAuthUser(updatedUser));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isOwnProfile = loggedInUser?._id === profileUser?._id;
  const isFollowing = profileUser?.followers?.includes(loggedInUser?._id);
  const isCloseFriend = loggedInUser?.closeFriends?.includes(profileUser?._id);

  const displayedPosts = activeTab === "posts" ? profileUser.posts : profileUser.bookmarks;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b pb-8 mb-8 border-gray-100">
        <div className="flex justify-center">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-2 border-gray-100 shadow-md">
            <AvatarImage src={profileUser.profilePicture} />
            <AvatarFallback className="text-3xl font-semibold">
              {profileUser.username?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="md:col-span-2 flex flex-col gap-5 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {profileUser.username}
            </h1>
            <div className="flex justify-center gap-2">
              {isOwnProfile ? (
                <>
                  <Button
                    onClick={() => navigate("/account/edit")}
                    variant="secondary"
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-6 py-1.5 h-auto text-sm rounded-lg"
                  >
                    Edit profile
                  </Button>
                  <Button variant="ghost" className="p-2 hover:bg-neutral-100 rounded-full h-auto">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={followOrUnfollowHandler}
                    className={`font-semibold px-6 py-1.5 h-auto text-sm rounded-lg ${
                      isFollowing
                        ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                        : "bg-[#0095F6] hover:bg-[#1877F2] text-white"
                    }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                  
                  {/* Connection Button Logic */}
                  {profileUser.isConnection ? (
                    <Button
                      onClick={() => connectionActionHandler("remove")}
                      className="bg-neutral-100 hover:bg-red-50 text-neutral-800 hover:text-red-600 font-semibold px-4 py-1.5 h-auto text-sm rounded-lg border border-neutral-200 hover:border-red-200"
                    >
                      Disconnect
                    </Button>
                  ) : loggedInUser?.sentConnectionRequests?.includes(profileUser?._id) ? (
                    <Button
                      onClick={() => connectionActionHandler("cancel")}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-4 py-1.5 h-auto text-sm rounded-lg"
                    >
                      Pending (Cancel)
                    </Button>
                  ) : loggedInUser?.receivedConnectionRequests?.includes(profileUser?._id) ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => connectionActionHandler("accept")}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1.5 h-auto text-sm rounded-lg"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => connectionActionHandler("reject")}
                        className="bg-transparent hover:bg-gray-100 text-gray-500 font-semibold px-4 py-1.5 h-auto text-sm rounded-lg border border-gray-200"
                      >
                        Ignore
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => connectionActionHandler("send")}
                      className="bg-blue-50 hover:bg-blue-100 text-[#0095F6] font-semibold px-4 py-1.5 h-auto text-sm rounded-lg border border-blue-200 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Connect
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around md:justify-start gap-8 border-t border-b md:border-0 py-3 md:py-0 border-gray-50">
            <span className="text-sm">
              <strong className="font-semibold block md:inline md:mr-1">
                {profileUser.posts?.length || 0}
              </strong>
              posts
            </span>
            <span className="text-sm">
              <strong className="font-semibold block md:inline md:mr-1">
                {profileUser.followers?.length || 0}
              </strong>
              followers
            </span>
            <span className="text-sm">
              <strong className="font-semibold block md:inline md:mr-1">
                {profileUser.following?.length || 0}
              </strong>
              following
            </span>
            <span className="text-sm cursor-pointer hover:text-[#0095F6] transition-colors" onClick={() => setConnectionsOpen(true)}>
              <strong className="font-semibold block md:inline md:mr-1">
                {profileUser.connections?.length || 0}
              </strong>
              connections
            </span>
            {isOwnProfile && (
              <span className="text-sm">
                <strong className="font-semibold block md:inline md:mr-1 text-green-600">
                  ₹{profileUser.walletBalance ? profileUser.walletBalance.toFixed(2) : "0.00"}
                </strong>
                earnings
              </span>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-sm text-gray-800">{profileUser.username}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {profileUser.bio || "No bio yet."}
            </p>
            
            {!isOwnProfile && profileUser.mutualConnections?.length > 0 && (
              <p className="text-[11px] text-gray-400 font-semibold mt-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Followed by {profileUser.mutualConnections[0]}
                {profileUser.mutualConnections.length > 1 && ` + ${profileUser.mutualConnections.length - 1} more`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t border-gray-100 gap-12">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 py-4 border-t-2 text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
            activeTab === "posts"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Grid className="w-4 h-4" />
          Posts
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 py-4 border-t-2 text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
              activeTab === "saved"
                ? "border-black text-black"
                : "border-transparent text-gray-400"
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            Saved
          </button>
        )}
      </div>
      {/* Connection Banner */}
      {!isOwnProfile && !profileUser.isConnection && (
        <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg text-center mb-6 mt-4 font-medium flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          Connect with {profileUser.username} to see their private posts.
        </div>
      )}

      {/* Grid */}
      {displayedPosts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          {activeTab === "posts" ? (
            <>
              <Grid className="w-12 h-12 stroke-[1.25]" />
              <span className="text-sm font-semibold">No Posts Yet</span>
            </>
          ) : (
            <>
              <BookmarkIcon className="w-12 h-12 stroke-[1.25]" />
              <span className="text-sm font-semibold">No Saved Posts</span>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4">
          {displayedPosts.map((post) => (
            <div
              key={post._id}
              className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden group border border-gray-100"
            >
              {post.mediaType === "video" ? (
                <video
                  src={post.image}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <img
                  src={post.image}
                  alt="Post item"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white transition-opacity duration-200 cursor-pointer">
                <span className="flex items-center gap-2 font-semibold">
                  <Heart className="w-5 h-5 fill-white text-white" />
                  {post.likes?.length || 0}
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <MessageCircle className="w-5 h-5 fill-white text-white" />
                  {post.comments?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connections Modal */}
      <Dialog open={connectionsOpen} onOpenChange={setConnectionsOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-xl rounded-xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-center font-bold text-base text-gray-800 flex justify-center items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Connections
            </h2>
          </DialogHeader>
          <div className="flex flex-col max-h-[400px] overflow-y-auto p-4 gap-4">
            {profileUser.connections?.length > 0 ? (
              profileUser.connections.map((conn) => (
                <div key={conn._id} className="flex items-center justify-between cursor-pointer" onClick={() => { setConnectionsOpen(false); navigate(`/profile/${conn._id}`); }}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-gray-100">
                      <AvatarImage src={conn.profilePicture} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                        {conn.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm text-gray-800">{conn.username}</span>
                  </div>
                  <Button variant="ghost" className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 h-8">
                    View Profile
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                No connections yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
