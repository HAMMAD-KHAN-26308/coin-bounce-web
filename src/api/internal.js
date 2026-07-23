import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_INTERNAL_API_PATH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function parseError(error) {
  return {
    success: false,
    message:
      error.response?.data?.message || error.message || "Something went wrong",
  };
}

export const login = async (data) => {
  let response;

  try {
    response = await api.post("/login", data);
  } catch (error) {
    return parseError(error);
  }

  return response;
};

export const signup = async (data) => {
  let response;

  try {
    response = await api.post("/register", data);
  } catch (error) {
    return parseError(error);
  }

  return response;
};

export const signout = async () => {
  let response;
  try {
    response = await api.post("/logout");
  } catch (error) {
    return error;
  }

  return response;
};

export const getAllBlogs = async () => {
  let response;

  try {
    response = await api.get("/blog/all");
  } catch (error) {
    return error;
  }

  return response;
};

export const submitBlog = async (data) => {
  let response;

  try {
    response = await api.post("/blog", data);
  } catch (error) {
    return error;
  }
  return response;
};

export const getBlogById = async (id) => {
  let response;

  try {
    response = await api.get(`/blog/${id}`);
  } catch (error) {
    return error;
  }

  return response;
};

export const getCommentsByID = async (id) => {
  let response;
  try {
    response = await api.get(`/comment/${id}`, { validateStatus: false });
  } catch (error) {
    return error;
  }

  return response;
};

export const postComment = async (data) => {
  let response;
  try {
    response = await api.post("/comment", data);
  } catch (error) {
    return error;
  }
  return response;
};

export const updateComment = async (id, data) => {
  let response;

  try {
    response = await api.put(`/comment/${id}`, data);
  } catch (error) {
    return error;
  }

  return response;
};

export const deleteComment = async (id) => {
  let response;

  try {
    response = await api.delete(`/comment/${id}`);
  } catch (error) {
    return error;
  }

  return response;
};

export const deleteBlog = async (id) => {
  let response;
  try {
    response = await api.delete(`/blog/${id}`);
  } catch (error) {
    return error;
  }

  return response;
};

export const updateBlog = async (data) => {
  let response;
  try {
    response = await api.put("/blog", data);
  } catch (error) {
    return error;
  }

  return response;
};

export const updateProfile = async (data) => {
  let response;
  try {
    response = await api.put("/profile", data);
    console.log("Profile update response:", response);
  } catch (error) {
    console.error("Update profile error:", error);
    return error.response || error;
  }

  return response;
};

export const changePassword = async (data) => {
  let response;
  try {
    response = await api.put("/password", data);
    console.log("Password change response:", response);
  } catch (error) {
    console.error("Password change error:", error);
    return error.response || error;
  }

  return response;
};

export const forgotPassword = async (email) => {
  try {
    return await api.post("/forgot-password", { email });
  } catch (error) {
    return parseError(error);
  }
};

export const verifyResetToken = async (token) => {
  try {
    return await api.post("/verify-reset-token", { token });
  } catch (error) {
    return parseError(error);
  }
};

export const resetPassword = async (payload) => {
  try {
    return await api.post("/reset-password", payload);
  } catch (error) {
    return parseError(error);
  }
};
