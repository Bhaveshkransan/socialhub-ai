import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/v1/post/all", {
          withCredentials: true,
        });
        if (res.data.success) {
          console.log("Fetched posts:", res.data.posts);
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchAllPost();
  }, [dispatch]);
};

export default useGetAllPost;
