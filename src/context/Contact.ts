import API from "@/api/api"
import { apiUrl } from "@/api/apiEndPoints"

export const getContacts = async (range: "Week" | "Month" | "Year" = "Month") => {
  const res = await API.get(`${apiUrl.CONTACT}/analytics?range=${range.toLowerCase()}`)
  return {
    data: res.data?.analytics || [],
    totalContacts: res.data?.totalContacts || 0,
    growthPercent: res.data?.growthPercent || 0,
    devices: res.data?.devices || {},
    browsers: res.data?.browsers || {},
  }
}

