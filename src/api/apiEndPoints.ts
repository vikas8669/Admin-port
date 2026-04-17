const apiEndPoints = import.meta.env.VITE_API_URL
console.log("meta =>>>>>>>>>......", import.meta.env.VITE_API_URL)


export const apiUrl = {

    login: `${apiEndPoints}/login`,
    signUp: `${apiEndPoints}/signup`,
    verify: `${apiEndPoints}/verify`,
    adminOnly: `${apiEndPoints}/admin-only`,
    logout: `${apiEndPoints}/logout`,
    CONTACT: `${apiEndPoints}/contact`,
    getContact: `${apiEndPoints}/contact`,
    getAllContacts: `${apiEndPoints}/contact`,
    markRead: (id: string) => `${apiEndPoints}/contact/${id}/mark-read`,
    sendReply: (id: string) => `${apiEndPoints}/contact/${id}/reply`,
    projects: `${apiEndPoints}/projects`, // POST, GET (list)
    projectById: (id: string) => `${apiEndPoints}/projects/${id}`, // GET, PUT, DELETE
    adminDashboard: `${apiEndPoints}/admin/dashboard`,
    adminPurchases: `${apiEndPoints}/admin/purchases`,
    notifications: `${apiEndPoints}/notifications`,
    markNotificationRead: (id: string) => `${apiEndPoints}/notifications/${id}/read`,
    markAllNotificationsRead: `${apiEndPoints}/notifications/mark-all-read`,
    deleteNotification: (id: string) => `${apiEndPoints}/notifications/${id}`,

    // Blogs
    blogs: `${apiEndPoints}/blogs`, // POST, GET (list)
    blogById: (id: string) => `${apiEndPoints}/blogs/${id}`, // PUT, DELETE
    blogBySlug: (slug: string) => `${apiEndPoints}/blogs/${slug}`, // GET (one)

    // Categories
    categories: `${apiEndPoints}/categories`,
}
