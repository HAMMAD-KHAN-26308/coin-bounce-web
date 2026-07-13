import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  email: "",
  name: "",
  username: "",
  photoPath: "",
  auth: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, email, name, username, auth, photoPath } = action.payload;
      state._id = _id;
      state.email = email;
      state.name = name;
      state.username = username;
      state.auth = auth;
      state.photoPath = photoPath;
    },
    resetUser: (state) => {
      state._id = "";
      state.email = "";
      state.name = "";
      state.username = "";
      state.auth = false;
      state.photoPath = "";
    },
  },
});

export const { setUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
