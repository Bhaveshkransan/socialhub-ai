import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessages";

const Messages = ({ selectedUser }) => {
  useGetAllMessage()
  const { messages } = useSelector((store) => store.chat);
  return (
    <div className="overflow-y-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar>
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <span>{selectedUser?.username}</span>

          <Link to={`/profile/${selectedUser?._id}`}>
            <Button>View profile</Button>
          </Link>
        </div>
      </div>
      <div>
        {
       messages  && messages.map((msg) => {
          return (
            <div className={`flex`}>
              <div>{msg}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
