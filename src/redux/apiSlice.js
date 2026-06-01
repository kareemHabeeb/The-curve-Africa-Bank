import {createSlice} from "@reduxjs/toolkit";

const apiSlice = createSlice({
    name: "apiSlice",
    initialState: {
        accessToken: null,
        refreshToken: null,
        user: null,
    },
    reducers: {
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        setRefreshToken: (state, action) => {
            state.refreshToken = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    }
})

export const { setAccessToken, setRefreshToken, setUser } = apiSlice.actions;
export default apiSlice.reducer;