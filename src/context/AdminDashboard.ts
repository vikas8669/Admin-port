import API from "@/api/api"
import { apiUrl } from "@/api/apiEndPoints"
import { useQuery } from "@tanstack/react-query"

export type TopProject = {
  id?: string
  title: string
  salesCount: number
  revenue: number
}

export type RecentPurchase = {
  id: string
  buyerName: string
  buyerEmail?: string
  projectTitle: string
  amount: number
  paymentStatus: string
  paymentId: string
  purchaseDate: string
}

export type DashboardSummary = {
  totalRevenue: number
  totalSales: number
  totalCustomers: number
  totalProjectsSold: number
  topProjects: TopProject[]
  recentPurchases: RecentPurchase[]
}

export type PurchaseHistoryItem = RecentPurchase

export type PurchaseHistoryResponse = {
  purchases: PurchaseHistoryItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const adminDashboardKeys = {
  summary: ["admin-dashboard", "summary"] as const,
  purchases: (params: { page: number; limit: number; status?: string; search?: string }) =>
    ["admin-dashboard", "purchases", params] as const,
}

const readNumber = (value: unknown) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const unwrapPayload = <T>(payload: T) => {
  const maybeData = (payload as any)?.data
  return maybeData ?? payload
}

const readString = (value: unknown, fallback = "—") => {
  if (typeof value === "string" && value.trim()) return value
  return fallback
}

const pickArray = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (Array.isArray(source?.[key])) return source[key]
  }
  return []
}

const normalizePurchase = (purchase: any): RecentPurchase => {
  const buyer = purchase?.buyer || purchase?.user || purchase?.customer || purchase?.purchasedBy || {}
  const project = purchase?.project || purchase?.product || {}

  return {
    id: readString(purchase?._id ?? purchase?.id, ""),
    buyerName: readString(
      buyer?.name ?? buyer?.username ?? purchase?.userName ?? purchase?.buyerName ?? purchase?.customerName,
      "Unknown buyer"
    ),
    buyerEmail: readString(
      buyer?.email ?? purchase?.userEmail ?? purchase?.buyerEmail ?? purchase?.customerEmail,
      ""
    ),
    projectTitle: readString(
      project?.title ?? project?.name ?? purchase?.projectTitle ?? purchase?.itemName,
      "Untitled project"
    ),
    amount: readNumber(purchase?.amount ?? purchase?.price ?? purchase?.totalAmount),
    paymentStatus: readString(
      purchase?.paymentStatus ?? purchase?.status ?? purchase?.payment?.status,
      "Unknown"
    ),
    paymentId: readString(
      purchase?.razorpay_payment_id ?? purchase?.paymentId ?? purchase?.transactionId ?? purchase?.payment?.id,
      "—"
    ),
    purchaseDate: readString(
      purchase?.purchaseDate ?? purchase?.createdAt ?? purchase?.paidAt,
      ""
    ),
  }
}

const normalizeTopProject = (project: any): TopProject => ({
  id: typeof project?._id === "string" ? project._id : project?.id,
  title: readString(project?.title ?? project?.name, "Untitled project"),
  salesCount: readNumber(project?.salesCount ?? project?.totalSales ?? project?.soldCount),
  revenue: readNumber(project?.revenue ?? project?.totalRevenue ?? project?.amount),
})

const fetchAdminSummary = async (): Promise<DashboardSummary> => {
  const res = await API.get(apiUrl.adminDashboard)
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to fetch dashboard summary")
  }

  const data = unwrapPayload(res.data)
  return {
    totalRevenue: readNumber(data?.totalRevenue),
    totalSales: readNumber(data?.totalSales),
    totalCustomers: readNumber(data?.totalCustomers),
    totalProjectsSold: readNumber(data?.totalProjectsSold),
    topProjects: pickArray(data, ["topProjects"]).map(normalizeTopProject),
    recentPurchases: pickArray(data, ["recentPurchases"]).map(normalizePurchase),
  }
}

const fetchAdminPurchases = async (params: {
  page: number
  limit: number
  status?: string
  search?: string
}): Promise<PurchaseHistoryResponse> => {
  const res = await API.get(apiUrl.adminPurchases, {
    params: {
      page: params.page,
      limit: params.limit,
      status: params.status ?? "",
      search: params.search ?? "",
    },
  })

  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to fetch purchase history")
  }

  const payload = res.data
  const rawData = Array.isArray(payload?.data) ? payload.data : pickArray(payload, ["purchases", "items", "results", "docs"])
  const purchases = rawData.map(normalizePurchase)
  
  const pagination = payload?.pagination ?? payload?.meta ?? {}
  const total = readNumber(payload?.total ?? pagination?.total ?? pagination?.count ?? purchases.length)
  const limit = readNumber(payload?.limit ?? pagination?.limit ?? params.limit) || params.limit
  const page = readNumber(payload?.page ?? pagination?.page ?? params.page) || params.page
  const totalPages =
    readNumber(payload?.totalPages ?? pagination?.totalPages) || Math.max(1, Math.ceil(total / limit))

  return {
    purchases,
    page,
    limit,
    total,
    totalPages,
  }
}

export const useAdminDashboardSummary = () =>
  useQuery({
    queryKey: adminDashboardKeys.summary,
    queryFn: fetchAdminSummary,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  })

export const useAdminPurchases = (params: {
  page: number
  limit: number
  status?: string
  search?: string
}) =>
  useQuery({
    queryKey: adminDashboardKeys.purchases(params),
    queryFn: () => fetchAdminPurchases(params),
    placeholderData: (previous) => previous,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })
