import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = (user) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.MODE === 'development' ? (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '' : 'https://socialhub-ai-backend.onrender.com'}//api/v1/user/suggested?_t=${Date.now()}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users || []));
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    if (user) {
      fetchSuggestedUsers();
    }
  }, [user, dispatch]);
};

export default useGetSuggestedUsers;
