import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
export const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth"/>;
  }
  try{
    const decoded = jwtDecode(auth)
    if(decoded.exp*1000 < Date.now()){
        localStorage.removeItem("token")
        return <Navigate to="/auth"/>
    }
  }catch{
    return <Navigate to="/auth"/>
  }

  return children;
};