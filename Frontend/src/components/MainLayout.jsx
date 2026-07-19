import React from "react";
import LeftSidebar from "./Leftsidebar";
import { Outlet } from "react-router-dom";
import useGetNotifications from "@/hooks/useGetNotifications";
import useGetRTM from "@/hooks/useGetRTM";

const MainLayout = () => {
  useGetNotifications();
  useGetRTM();
  return (
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      <LeftSidebar />

      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
