import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/authSlice";

const useGetUserProfile = (id) => {
  const dispatch = useDispatch();

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/${id}/profile`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUserProfile(res.data.user));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id, dispatch]);

  return { fetchUserProfile };
};

export default useGetUserProfile;
