import { Routes, Route, Navigate, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import AddPost from "./pages/Blog/AddPost";
import AllPosts from "./pages/Blog/AllPosts";
import Categories from "./pages/Blog/Categories";
import AllMessages from "./pages/contact/AllMessages";
import RepliedMessages from "./pages/contact/RepliedMessages";
import UnreadMessages from "./pages/contact/UnreadMessages";

import Login from "./pages/Auth/Login";

import ProtectedRoute from "./components/ProtectRoute";
import PublicRoute from "./pages/Auth/PublicRoute";
import AddProjects from "./pages/Projects/AddProjects";
import AllProjects from "./pages/Projects/AllProjects";
import EditProject from "./pages/Projects/EditProject";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Route (Login protected if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<AllPosts />} />
          <Route path="posts/new" element={<AddPost />} />
          <Route path="categories" element={<Categories />} />
          <Route path="messages" element={<AllMessages />} />
          <Route path="messages/unread" element={<UnreadMessages />} />
          <Route path="messages/replied" element={<RepliedMessages />} />
          <Route path="/admin/all/projects" element={<AllProjects />} />
          <Route path="/admin/projects" element={<AddProjects />} />
          <Route path="/admin/projects/:id/edit" element={<EditProject />} />

        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;