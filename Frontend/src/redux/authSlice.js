import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState:{
        user:null,
        userProfile:null,
        selectedUser:null,
        suggestedUsers:[],
        token: null,
    },
    reducers:{
        setAuthUser :(state,action) =>{
            state.user=action.payload;
            if (!action.payload) {
                state.userProfile = null;
                state.selectedUser = null;
                state.suggestedUsers = [];
            }
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setUserProfile :(state,action) =>{
            state.userProfile=action.payload;
        },
        setSuggestedUsers:(state,action) =>{
            state.suggestedUsers=action.payload;
        },
        setSelectedUser :(state, action)=>{
                  state.selectedUser=action.payload;
        },
        addConnection: (state, action) => {
            if (state.user && !state.user.connections.some(c => c._id === action.payload._id)) {
                state.user.connections.push(action.payload);
            }
        },
        removeConnection: (state, action) => {
            if (state.user) {
                state.user.connections = state.user.connections.filter(c => c._id !== action.payload);
            }
        }
    }
})

export const {setAuthUser, setUserProfile, setSuggestedUsers, setSelectedUser, addConnection, removeConnection, setToken} = authSlice.actions;
export default authSlice.reducer