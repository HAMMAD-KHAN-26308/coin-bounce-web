import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  email: "",
  name: "",
  username: "",
  password: "",
  photoPath: "",
  auth: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, email, password, name, username, auth, photoPath } =
        action.payload;
      state._id = _id;
      state.email = email;
      state.name = name;
      state.username = username;
      state.password = password;
      state.auth = auth;
      state.photoPath = photoPath;
    },
    updateUser: (state, action) => {
      if (action.payload.name) state.name = action.payload.name;
      if (action.payload.email) state.email = action.payload.email;
      if (action.payload.photoPath) state.photoPath = action.payload.photoPath;
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

export const { setUser, updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
