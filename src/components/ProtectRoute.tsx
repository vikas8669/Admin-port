// src/routes/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "@/api/api";
import { apiUrl } from "@/api/apiEndPoints";
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

        if (user?.role === "Admin") {
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
    <div className="min-h-screen flex bg-zinc-950 text-white">
      
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex w-64 flex-col bg-zinc-900 border-r border-zinc-800 p-4 space-y-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>

        {/* Table Section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

      </div>
    </div>
  );
}

  if (!isAuth) return <Navigate to="/login" replace />;

  return <>{children}</>;
}