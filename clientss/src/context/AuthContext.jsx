import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";  
import { login, register } from "../lib/api"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : null;
  });

  const loginUser = async (email, password) => {
    const response = await login(email, password);
    console.log(response)
  const userData = response.user;
  
  setUser(userData);
  console.log(userData); 
    Cookies.set("user", JSON.stringify(response.user), { expires: 1, secure: true, sameSite: "Strict" });
  };

  const registerUser = async (firstName, lastName, email, password) => {
    const response = await register(firstName, lastName, email, password);
    setUser(response.user); 
    Cookies.set("user", JSON.stringify(response.user), { expires: 1, secure: true, sameSite: "Strict" });
  };

  const logout = () => {
    setUser(null);  
    Cookies.remove("user"); 
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
