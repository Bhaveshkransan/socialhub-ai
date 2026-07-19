import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { setMessages } from "@/redux/chatSlice";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const {selectedUser} = useSelector(store=>store.auth)

  useEffect(() => {
    const fetchAllMessgaes = async () => {
      try {
        const res = await axios.get(`${import.meta.env.MODE === 'development' ? (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '' : 'https://socialhub-ai-backend.onrender.com'}//api/v1/all/${selectedUser?._id}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchAllMessgaes();
  }, [dispatch]);
};

export default useGetAllMessage;
