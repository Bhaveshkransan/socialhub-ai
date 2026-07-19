import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, addUnreadMessage } from "@/redux/chatSlice";
import { toast } from "sonner";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector((store) => store.socketio);
    const { messages } = useSelector((store) => store.chat);
    const { selectedUser, user } = useSelector((store) => store.auth);
    
    useEffect(() => {
        const handleNewMessage = (newMessage) => {
            // Don't process messages sent by ourselves
            if (newMessage.senderID === user?._id) return;

            const isViewingThisChat = selectedUser?._id === newMessage.senderID;

            if (isViewingThisChat) {
                // Append to the live chat window
                dispatch(setMessages([...(messages || []), newMessage]));
            } else {
                // Mark as unread so blue dot shows in user list
                dispatch(addUnreadMessage(newMessage.senderID));
                toast.info("New message received");
            }
        };
        
        socket?.on('newMessage', handleNewMessage);

        return () => {
            socket?.off('newMessage', handleNewMessage);
        };
    }, [messages, dispatch, socket, selectedUser, user]);
};

export default useGetRTM;
