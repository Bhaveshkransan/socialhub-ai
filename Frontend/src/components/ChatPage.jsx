import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import useGetAllMessage from "@/hooks/useGetAllMessage";

import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";
import { setMessages, clearUnreadMessage } from "@/redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth,
  );
  const { onlineUsers, messages, unreadMessageMap } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        dispatch(setMessages([...(messages || []), res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);
  // Ensure suggested users are fetched even if the user went straight to /chat
  useGetSuggestedUsers(user);
  useGetAllMessage(selectedUser?._id);


  return (
    <div className="flex h-screen bg-gray-50 md:p-6 lg:p-8">
      {/* Left Sidebar for chat list */}
      <section className="w-full md:w-[350px] border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col h-full overflow-hidden shrink-0">
        {/* Header - Logged In User */}
        <div className="h-[76px] flex items-center gap-3 px-6 border-b border-gray-100 bg-white shrink-0">
          <Avatar className="w-10 h-10 ring-1 ring-gray-100 shadow-sm">
            <AvatarImage src={user?.profilePicture} className="object-cover" />
            <AvatarFallback className="bg-gray-100 font-bold text-gray-700">
              {user?.username?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold text-xl text-gray-900 truncate">
            {user?.username}
          </span>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-1">
          {(suggestedUsers || [])
            .filter((sUser) => sUser._id !== user?._id)
            .map((sUser) => {
              const isSelected = selectedUser?._id === sUser._id;
              const isOnline = onlineUsers.includes(sUser._id);

              return (
                <div
                  onClick={async () => {
                    dispatch(setSelectedUser(sUser));
                    dispatch(clearUnreadMessage(sUser._id));
                    try {
                      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/notification/read/message/${sUser._id}`, {}, {
                        withCredentials: true
                      });
                    } catch (error) {
                      console.log("Error marking messages as read", error);
                    }
                  }}
                  key={sUser._id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors active:scale-[0.98] ${
                    isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar className="w-14 h-14 shrink-0 ring-1 ring-gray-100 shadow-sm">
                    <AvatarImage
                      src={sUser?.profilePicture}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-100 font-bold text-gray-700">
                      {sUser?.username?.substring(0, 2).toUpperCase() || "CN"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-[15px] text-gray-900 truncate">
                      {sUser?.username || sUser?.profilePicture}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-xs font-bold ${isOnline ? "text-green-600" : "text-red-600"} `}
                      >
                        {isOnline ? "online" : "offline"}
                      </span>
                      {unreadMessageMap?.[sUser._id] && (
                        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse mt-[1px]"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Main Chat Window */}
      {selectedUser ? (
        <section className="hidden md:flex flex-1 border border-gray-200 rounded-2xl bg-white shadow-sm flex-col h-full overflow-hidden ml-6">
          {/* Chat Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0 shadow-sm">
            <Avatar className="w-11 h-11 ring-1 ring-gray-100 shadow-sm">
              <AvatarImage
                src={selectedUser?.profilePicture}
                alt="profile"
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100 font-bold text-gray-700">
                {selectedUser?.username?.substring(0, 2).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-[16px] text-gray-900">
                {selectedUser?.username}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Active now
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/30">
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderID === user?._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[15px] ${
                      msg.senderID === user?._id
                        ? "bg-[#0095F6] text-white rounded-br-sm"
                        : "bg-gray-200 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center mt-10 text-gray-400 text-sm font-medium">
                No messages yet. Send a message to start chatting!
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                type="text"
                placeholder="Message..."
                className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                className="bg-[#0095F6] hover:bg-[#1877F2] text-white px-7 py-5 rounded-full font-semibold transition-colors"
              >
                Send
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="hidden md:flex flex-1 border border-gray-200 rounded-2xl bg-white shadow-sm flex-col items-center justify-center h-full ml-6">
          <div className="flex flex-col items-center justify-center gap-3 max-w-sm text-center">
            <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center mb-2">
              <MessageCircle className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <h1 className="text-[22px] font-medium text-gray-900">
              Your messages
            </h1>
            <span className="text-sm text-gray-500 font-medium">
              Send private photos and messages to a friend or group.
            </span>
          </div>
        </section>
      )}
    </div>
  );
};

export default ChatPage;
