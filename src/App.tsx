import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./components/Dashboard"
import Dashboard from "./pages/Dashboard"
import AddPost from "./pages/Blog/AddPost"
import AllPosts from "./pages/Blog/AllPosts"
import Categories from "./pages/Blog/Categories"
import AllMessages from "./pages/contact/AllMessages"
import RepliedMessages from "./pages/contact/RepliedMessages"
import UnreadMessages from "./pages/contact/UnreadMessages"





function App() {
  return (
<Routes>
      {/* Redirect root to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="posts" element={<AllPosts />} />
        <Route path="posts/new" element={<AddPost />} />
        <Route path="categories" element={<Categories />} />

        <Route path="messages" element={<AllMessages />} />
        <Route path="messages/unread" element={<UnreadMessages />} />
        <Route path="messages/replied" element={<RepliedMessages />} />
      </Route>
    </Routes>
  )
}

export default App
