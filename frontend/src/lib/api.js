import axios from "axios"
import Cookies from "js-cookie"

const api = axios.create({
  baseURL: ""
})

api.interceptors.request.use((config) => {
  const token = Cookies.get("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = async (firstName, lastName, email, password) => {
  try {
    const response = await api.post("/api/auth/register", {
      firstName,
      lastName,
      email,
      password
    })
    return response.data
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      "An error occurred during registration."
    throw new Error(errorMessage)
  }
}

export const login = async (email, password) => {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password
    })

    if (response.data?.token) {
      Cookies.set("token", response.data.token, {
        expires: 1,
        secure: true,
        sameSite: "Strict"
      })
    } else {
      throw new Error("Token is missing in response.")
    }

    return response.data
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      "An error occurred during login."
    throw new Error(errorMessage)
  }
}

export default api
