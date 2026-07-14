import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";
import { useAuth } from "../contexts/AuthContext";

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const isAdmin = userData?.roles === "ADMIN";

        await api.post("/logoutt");

        logout();
        localStorage.clear();

        navigate(isAdmin ? "/auth/admin" : "/", { replace: true });
      } catch {
        setError("Logout failed. Please try again.");

        logout();
        localStorage.clear();

        navigate("/", { replace: true });
      }
    };

    logoutUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <h5 className="text-gray-500 text-lg mb-2">Logging out...</h5>
            <p className="text-gray-400 text-sm">Signing you out securely...</p>
          </>
        ) : (
          <>
            <h5 className="text-red-500 text-lg mb-2">Logout failed</h5>
            <p className="text-gray-400 text-sm">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Logout;
