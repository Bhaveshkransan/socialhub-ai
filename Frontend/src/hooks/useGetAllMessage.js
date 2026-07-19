import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMessages } from "@/redux/chatSlice";

const useGetAllMessage = (selectedUserId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/v1/message/all/${selectedUserId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setMessages(res.data.messages || []));
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedUserId) {
      fetchMessages();
    }
  }, [selectedUserId, dispatch]);
};

export default useGetAllMessage;
