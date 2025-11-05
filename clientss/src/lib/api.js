import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (firstName, lastName, email, password) => {
  try {
    const response = await api.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "An error occurred during registration.";
    console.error("Registration Error: ", error);
    throw new Error(errorMessage); 
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (response.data && response.data.token) {
      Cookies.set("token", response.data.token, { expires: 1, secure: true, sameSite: "Strict" });
    } else {
      throw new Error("Token is missing in response.");
    }

    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "An error occurred during login.";
    console.error("Login Error: ", error);
    throw new Error(errorMessage);
  }
};

export default api;
