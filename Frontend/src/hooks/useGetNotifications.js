import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setLikeNotification } from "@/redux/rtnSlice";
import { setUnreadMessageMap } from "@/redux/chatSlice";

const useGetNotifications = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.auth);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get("/api/v1/notification", {
                    withCredentials: true,
                });
                if (res.data.success) {
                    const allNotifications = res.data.notifications;
                    // Split notifications by type
                    const messageNotifications = allNotifications.filter(n => n.type === "message" && !n.read);
                    const generalNotifications = allNotifications.filter(n => n.type !== "message");
                    
                    dispatch(setLikeNotification(generalNotifications));
                    
                    // Build map of unread messages by sender
                    const unreadMap = {};
                    messageNotifications.forEach(n => {
                        unreadMap[n.sender._id] = true;
                    });
                    dispatch(setUnreadMessageMap(unreadMap));
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user, dispatch]);
};

export default useGetNotifications;
