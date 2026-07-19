import React from "react";
import Feed from "./Feed";
import Rightsidebar from "./Rightsidebar";
import { Outlet } from "react-router-dom";
import useGetAllPost from "@/hooks/useGetAllPost";


const Home = () => {
  useGetAllPost();
  return (
    <div className="flex w-full px-4 lg:px-8 py-6">
      {/* Feed column (Centered in the remaining space) */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[550px]">
          <Feed />
          <Outlet />
        </div>
      </div>
      {/* Right sidebar — absolute right edge */}
      <div className="hidden lg:block w-80 xl:w-[350px] shrink-0 ml-8">
        <Rightsidebar />
      </div>
    </div>
  );
};

export default Home;
