import API from "@/api/api";
import { apiUrl } from "@/api/apiEndPoints";

export const fetchNotifications = async () => {
  try {
    const res = await API.get(apiUrl.notifications);
    if (!res.data.success) throw new Error(res.data.message || "Failed to fetch notifications");
    return {
      notifications: res.data.data,
      unreadCount: res.data.unreadCount
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong");
  }
};

export const markRead = async (id: string) => {
  try {
    const res = await API.put(apiUrl.markNotificationRead(id));
    if (!res.data.success) throw new Error(res.data.message || "Failed to mark notification as read");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong");
  }
};

export const markAllRead = async () => {
  try {
    const res = await API.put(apiUrl.markAllNotificationsRead);
    if (!res.data.success) throw new Error(res.data.message || "Failed to mark all as read");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong");
  }
};

export const removeNotification = async (id: string) => {
  try {
    const res = await API.delete(apiUrl.deleteNotification(id));
    if (!res.data.success) throw new Error(res.data.message || "Failed to delete notification");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong");
  }
};
