// src/routes/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "@/api/api";
import { apiUrl } from "@/api/apiEndPoints";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(apiUrl.adminOnly);
        const user = res.data?.user;
        const message = res?.data?.message;

        if (user?.role === "Admin") {
          toast.success(message);
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.log(err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  // 🔥 Responsive Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 px-4">
        <div className="w-full max-w-md space-y-4 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <Skeleton className="h-8 w-2/3 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-4/6 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  return <>{children}</>;
}