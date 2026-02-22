import API from "@/api/api"
import { apiUrl } from "@/api/apiEndPoints"

// Fetch analytics (for charts, not table)
export const getContacts = async (range: "Week" | "Month" | "Year" = "Month") => {
  try {
    const res = await API.get(`${apiUrl.CONTACT}/analytics?range=${range.toLowerCase()}`)
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch contacts analytics")
    }
    return {
      data: res.data?.analytics || [],
      totalContacts: res.data?.totalContacts || 0,
      growthPercent: res.data?.growthPercent || 0,
      devices: res.data?.devices || {},
      browsers: res.data?.browsers || {},
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong")
  }
}

// Fetch all contacts (for table)
export const fetchAllContacts = async () => {
  try {
    const res = await API.get(apiUrl.getAllContacts)
    if (!res.data.success) throw new Error(res.data.message || "Failed to fetch contacts")
    return res.data.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong")
  }
}

// Mark a contact as read
export const markRead = async (id: string) => {
  try {
    const res = await API.patch(apiUrl.markRead(id)) // <-- use function
    if (!res.data.success) throw new Error(res.data.message || "Failed to mark read")
    return res.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong")
  }
}

// Send reply to a contact
export const sendReply = async (id: string, reply: string) => {
  try {
    const res = await API.patch(apiUrl.sendReply(id), { reply }) // <-- use function
    if (!res.data.success) throw new Error(res.data.message || "Failed to send reply")
    return res.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong")
  }
}