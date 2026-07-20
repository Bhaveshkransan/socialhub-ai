import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  const { token } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get("/api/v1/post/all", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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
