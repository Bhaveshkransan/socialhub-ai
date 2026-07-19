import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../src/components/Login";
import Home from "../src/components/Home";
import MainLayout from "../src/components/MainLayout";
import Signup from "../src/components/Signup";
import ProtectedRoute from "../src/components/ProtectedRoute";
import Profile from "../src/components/Profile";
import EditProfile from "../src/components/EditProfile";
import ChatPage from "./components/ChatPage";
import Analytics from "./components/Analytics";
import SearchPage from "./components/SearchPage";
import FriendsPage from "./components/FriendsPage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";
import { removePost } from "./redux/postSlice";

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store)=> store.socketio)
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io(import.meta.env.VITE_BACKEND_URL, {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));

      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      
      socketio.on("notification",(notification)=>{
        dispatch(setLikeNotification(notification))
      })

      socketio.on("deletePost", (postId) => {
        dispatch(removePost(postId));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if(socket){
      socket.close();
      dispatch(setSocket(null))
    }

  },[user, dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/account/edit" element={<EditProfile />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/friends" element={<FriendsPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
