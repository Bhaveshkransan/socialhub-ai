import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
        if(action.payload.type === 'like'){
            state.likeNotification.push(action.payload);
        } else if(action.payload.type === 'dislike'){
            state.likeNotification = state.likeNotification.filter((item)=> item.userId !== action.payload.userId);
        } else {
            // For fetching all notifications on load (which comes as an array)
            if (Array.isArray(action.payload)) {
                state.likeNotification = action.payload;
            } else {
                state.likeNotification.push(action.payload);
            }
        }
    },
    markAllAsRead: (state) => {
        state.likeNotification = state.likeNotification.map(notification => ({ ...notification, read: true }));
    }
  },
});

export const {setLikeNotification, markAllAsRead} = rtnSlice.actions;
export default rtnSlice.reducer;