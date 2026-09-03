import api from "./axios";

export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};













/*
SignupPage
    ↓
registerUser()
    ↓
Axios POST
    ↓
http://localhost:5000/api/auth/register
    ↓
Backend auth.routes.ts
    ↓
validate(registerSchema)
    ↓
register controller
    ↓
MongoDB
*/