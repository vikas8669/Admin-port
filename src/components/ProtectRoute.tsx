// src/routes/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "@/api/api";
import { apiUrl } from "@/api/apiEndPoints";
import { toast } from "sonner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // setIsAuth(false);
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(apiUrl.adminOnly); // Admin check
        const user = res.data?.user;
        const message = res?.data.message

        if (user?.role === "Admin") {
          
          toast.success(message)
          setIsAuth(true)
        } 
        else setIsAuth(false);
      } catch (err) {
        console.log(err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  if (loading) return <p className="text-white mt-20 text-center">Verifying...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
