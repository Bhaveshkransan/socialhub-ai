import React, { useState } from "react";
import {
  Home,
  Search,
  LogOut,
  MessageCircle,
  PlusSquare,
  TrendingUp,
  Heart,
  BarChart3,
  Moon,
  Sun,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, addConnection } from "@/redux/authSlice";
import { markAllAsRead } from "@/redux/rtnSlice";
import CreatePost from "./CreatePost";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const { user } = useSelector((store) => store.auth);
  const {likeNotification} = useSelector((store) => store.realTimeNotification);
  const { unreadMessageMap } = useSelector((store) => store.chat);
  const unreadMessageCount = Object.keys(unreadMessageMap || {}).length;

  const markNotificationsAsRead = async () => {
    try {
      await axios.post("/api/v1/notification/read", {}, {
        withCredentials: true
      });
      // Clear locally after reading
      dispatch(markAllAsRead());
    } catch (error) {
      console.log(error);
    }
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.get("/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Logout failed");
      dispatch(setAuthUser(null));
      navigate("/login");
    }
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const sidebarHandlers = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Messages") {
      navigate("/chat");
    } else if (textType === "Search") {
      navigate("/search");
    } else if (textType === "Friends") {
      navigate("/friends");
    } else if (textType === "Analytics") {
      navigate("/analytics");
    } else if (textType === "Notifications") {
      if (!showNotifications) {
        markNotificationsAsRead();
      }
      setShowNotifications(!showNotifications);
    }
  };

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, text: "Home" },
    { icon: <Search className="w-5 h-5" />, text: "Search" },
    { icon: <Users className="w-5 h-5" />, text: "Friends" },
    { icon: <BarChart3 className="w-5 h-5" />, text: "Analytics" },
    { icon: <MessageCircle className="w-5 h-5" />, text: "Messages" },
    { icon: <Heart className="w-5 h-5" />, text: "Notifications" },
    { icon: <PlusSquare className="w-5 h-5" />, text: "Create" },
    {
      icon: (
        <Avatar size="sm" className="w-5 h-5 border border-gray-200">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback className="text-[10px] font-bold">
            {user?.username?.substring(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut className="w-5 h-5 text-red-500" />, text: "Logout" },
  ];

  return (
    <>
      {/* Vertical Sidebar (Desktop & Tablet) */}
      <div className="hidden md:flex flex-col justify-between h-screen sticky top-0 border-r border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 lg:p-5 transition-all duration-300 w-16 lg:w-64 flex-shrink-0 z-40">
        <div className="flex flex-col gap-6">
          {/* Brand Logo Header */}
          <div className="px-1 py-2 lg:px-3">
            <div className="hidden lg:flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate("/")}>
              <img 
                src="/chatimage.png" 
                alt="Logo" 
                className="h-14 w-14 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
              <h1 className="text-xl font-serif tracking-wider font-extrabold italic bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                SocialHub AI
              </h1>
            </div>
            
            <div className="flex lg:hidden justify-center w-full cursor-pointer select-none" onClick={() => navigate("/")}>
              <img 
                src="/chatimage.png" 
                alt="S" 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  document.getElementById('fallback-logo-text-mobile').style.display = 'block';
                }}
              />
              <h1
                id="fallback-logo-text-mobile"
                className="text-xl font-serif font-extrabold italic bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent text-center"
                style={{ display: 'none' }}
              >
                S
              </h1>
            </div>
          </div>

          {/* Sidebar Items */}
          <nav className="flex flex-col gap-1.5">
            {sidebarItems.map((item, index) => {
              const isLogout = item.text === "Logout";
              const isNotification = item.text === "Notifications";
              const isMessage = item.text === "Messages";
              const unreadCount = likeNotification?.filter(n => !n.read)?.length || 0;
              
              return (
                <button
                  onClick={() => sidebarHandlers(item.text)}
                  key={index}
                  className={`relative flex items-center gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all duration-200 text-left font-medium text-sm w-full cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-900 active:scale-[0.98] justify-center lg:justify-start ${
                    isLogout
                      ? "text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      : "text-neutral-700 hover:text-neutral-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  }`}
                >
                  <span className="relative flex items-center justify-center shrink-0 w-6 h-6">
                    {item.icon}
                    {isNotification && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-zinc-950">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {isMessage && unreadMessageCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-zinc-950">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                      </span>
                    )}
                  </span>
                  <span className="truncate hidden lg:block">{item.text}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile brief & Dark Mode */}
        <div className="flex flex-col gap-2 mt-auto p-2 lg:p-3 border-t border-neutral-100 dark:border-zinc-900">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all duration-200 text-left font-medium text-sm w-full cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-900 text-neutral-700 dark:text-zinc-300 justify-center lg:justify-start"
          >
            <span className="shrink-0 w-6 h-6 flex items-center justify-center">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </span>
            <span className="truncate hidden lg:block">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          
          {user && (
            <div className="flex items-center gap-3 justify-center lg:justify-start mt-2">
              <Avatar className="w-8 h-8 lg:w-9 lg:h-9 border border-neutral-200">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback>
                  {user.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 hidden lg:flex">
                <span className="text-xs font-semibold text-neutral-800 dark:text-zinc-200 truncate">
                  {user.username}
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-zinc-950 border-t border-neutral-100 dark:border-zinc-900 flex items-center justify-around px-4 z-50 shadow-md">
        <button
          onClick={() => navigate("/")}
          className="text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 p-2 cursor-pointer active:scale-90 transition-transform"
        >
          <Home className="w-5.5 h-5.5" />
        </button>
        <button
          onClick={() => navigate("/search")}
          className="text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 p-2 cursor-pointer active:scale-90 transition-transform"
        >
          <Search className="w-5.5 h-5.5" />
        </button>
        <button
          onClick={() => setOpen(true)}
          className="text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 p-2 cursor-pointer active:scale-90 transition-transform"
        >
          <PlusSquare className="w-5.5 h-5.5" />
        </button>
        <button
          onClick={() => navigate("/friends")}
          className="text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 p-2 cursor-pointer active:scale-90 transition-transform"
        >
          <Users className="w-5.5 h-5.5" />
        </button>
        <button
          onClick={() => navigate("/chat")}
          className="text-neutral-700 dark:text-zinc-300 hover:text-neutral-900 p-2 cursor-pointer active:scale-90 transition-transform"
        >
          <MessageCircle className="w-5.5 h-5.5" />
        </button>
        <button
          onClick={() => navigate(`/profile/${user?._id}`)}
          className="p-2 cursor-pointer active:scale-90 transition-transform shrink-0"
        >
          <Avatar className="w-6.5 h-6.5 border border-neutral-200">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback className="text-[9px] font-bold">
              {user?.username?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>

      {/* Notifications Popover */}
      {showNotifications && (
        <>
          {/* Overlay to handle outside clicks */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed top-0 left-0 md:left-64 h-screen w-full md:w-96 bg-white dark:bg-zinc-950 border-r border-neutral-200 dark:border-zinc-800 shadow-xl z-50 overflow-y-auto slide-in-from-left-4 animate-in duration-300">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
              <h2 className="text-xl font-bold">Notifications</h2>
            <button onClick={() => setShowNotifications(false)} className="md:hidden p-2 text-neutral-500 hover:text-black">
              ✕
            </button>
          </div>
          <div className="flex flex-col p-2">
            {likeNotification?.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">No new notifications</div>
            ) : (
              likeNotification?.map((notification) => (
                <div key={notification._id} className="flex flex-col gap-2 p-3 hover:bg-neutral-100 dark:hover:bg-zinc-900 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.userDetails?.profilePicture || notification.sender?.profilePicture} />
                      <AvatarFallback>
                        {(notification.userDetails?.username || notification.sender?.username)?.substring(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        <span className="font-bold">{notification.userDetails?.username || notification.sender?.username}</span>{" "}
                        {notification.type === "like" ? "liked your post." : 
                         notification.type === "connection_request" ? "sent you a connection request." : "commented on your post."}
                      </span>
                    </div>
                  </div>
                  {notification.type === "connection_request" && (
                    <div className="flex gap-2 ml-13 mt-1">
                      <button 
                        onClick={async () => {
                           try {
                             const senderId = notification.userId || notification.sender?._id;
                             await axios.post(`/api/v1/user/connection-request/${senderId}/accept`, {}, { withCredentials: true });
                             toast.success("Connection request accepted");
                             markNotificationsAsRead();
                             dispatch(addConnection({
                               _id: senderId,
                               username: notification.userDetails?.username || notification.sender?.username,
                               profilePicture: notification.userDetails?.profilePicture || notification.sender?.profilePicture
                             }));
                           } catch (err) { toast.error("Error accepting request"); }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-semibold rounded-md"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={async () => {
                           try {
                             await axios.post(`/api/v1/user/connection-request/${notification.userId}/reject`, {}, { withCredentials: true });
                             toast.success("Connection request ignored");
                             markNotificationsAsRead();
                           } catch (err) { toast.error("Error ignoring request"); }
                        }}
                        className="bg-transparent hover:bg-gray-100 text-gray-500 px-3 py-1 text-xs font-semibold rounded-md transition-colors"
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}

      {/* Create Post Dialog */}
      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
};

export default LeftSidebar;
