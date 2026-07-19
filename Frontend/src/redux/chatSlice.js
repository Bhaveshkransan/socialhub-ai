import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],
    messages: [],
    unreadMessageMap: {} // { senderId: boolean }
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setMessages: (state, action) =>{
        state.messages = action.payload;
    },
    addUnreadMessage: (state, action) => {
        if (!state.unreadMessageMap) {
            state.unreadMessageMap = {};
        }
        state.unreadMessageMap[action.payload] = true;
    },
    clearUnreadMessage: (state, action) => {
        if (state.unreadMessageMap) {
            delete state.unreadMessageMap[action.payload];
        }
    },
    setUnreadMessageMap: (state, action) => {
        state.unreadMessageMap = action.payload;
    }
  },
});

export const { setOnlineUsers, setMessages, addUnreadMessage, clearUnreadMessage, setUnreadMessageMap } = chatSlice.actions;
export default chatSlice.reducer;
