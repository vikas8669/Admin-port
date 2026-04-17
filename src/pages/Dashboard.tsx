import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  DollarSign,
  FolderKanban,
  Receipt,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounce"
import {
  useAdminDashboardSummary,
  useAdminPurchases,
  type PurchaseHistoryItem,
} from "@/context/AdminDashboard"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value || 0)

const formatDate = (value: string) => {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getPaymentStatusClass = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes("success") || normalized.includes("paid") || normalized.includes("complete")) {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
  }
  if (normalized.includes("pending") || normalized.includes("process")) {
    return "bg-amber-500/10 text-amber-700 border border-amber-500/20"
  }
  if (normalized.includes("fail") || normalized.includes("cancel")) {
    return "bg-rose-500/10 text-rose-700 border border-rose-500/20"
  }
  return "bg-muted text-muted-foreground border border-border"
}

const tableColumns = [
  "Buyer",
  "Project",
  "Amount",
  "Payment Status",
  "Payment ID",
  "Purchase Date",
] as const

function PurchaseRows({ rows }: { rows: PurchaseHistoryItem[] }) {
  return (
    <TableBody>
      {rows.map((purchase) => (
        <TableRow key={purchase.id || `${purchase.paymentId}-${purchase.purchaseDate}`}>
          <TableCell>
            <div className="font-medium">{purchase.buyerName}</div>
            {purchase.buyerEmail ? (
              <div className="text-xs text-muted-foreground">{purchase.buyerEmail}</div>
            ) : null}
          </TableCell>
          <TableCell>{purchase.projectTitle}</TableCell>
          <TableCell className="font-medium">{formatCurrency(purchase.amount)}</TableCell>
          <TableCell>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClass(purchase.paymentStatus)}`}>
              {purchase.paymentStatus}
            </span>
          </TableCell>
          <TableCell className="font-mono text-xs sm:text-sm">{purchase.paymentId}</TableCell>
          <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Number(searchParams.get("page") || 1)
  const initialStatus = searchParams.get("status") || ""
  const initialSearch = searchParams.get("search") || ""

  const [page, setPage] = React.useState(initialPage)
  const [status, setStatus] = React.useState(initialStatus)
  const [search, setSearch] = React.useState(initialSearch)
  const debouncedSearch = useDebouncedValue(search, 400)

  React.useEffect(() => {
    const params: Record<string, string> = {}
    if (page > 1) params.page = String(page)
    if (status) params.status = status
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    setSearchParams(params, { replace: true })
  }, [page, status, debouncedSearch, setSearchParams])

  const summaryQuery = useAdminDashboardSummary()
  const purchasesQuery = useAdminPurchases({
    page,
    limit: 10,
    status,
    search: debouncedSearch.trim(),
  })

  const summary = summaryQuery.data
  const purchases = purchasesQuery.data?.purchases || []
  const totalPages = purchasesQuery.data?.totalPages || 1
  const totalRecords = purchasesQuery.data?.total || purchases.length

  const statCards = [
    {
      title: "Total Revenue",
      description: "Gross earnings across all purchases",
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: DollarSign,
    },
    {
      title: "Total Sales",
      description: "Completed sales transactions",
      value: (summary?.totalSales || 0).toLocaleString(),
      icon: ShoppingCart,
    },
    {
      title: "Total Customers",
      description: "Unique buyers in the system",
      value: (summary?.totalCustomers || 0).toLocaleString(),
      icon: Users,
    },
    {
      title: "Projects Sold",
      description: "Project units purchased",
      value: (summary?.totalProjectsSold || 0).toLocaleString(),
      icon: FolderKanban,
    },
  ]

  return (
    <div className="space-y-8 w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="flex flex-col gap-2 pt-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Revenue stats, top-selling projects, and recent purchase activity.
        </p>
      </div>

      {summaryQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {(summaryQuery.error as Error)?.message || "Failed to load admin dashboard summary."}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
          >
            <Card className="h-full border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-9 w-28" />
                ) : (
                  <p className="text-3xl font-bold">{card.value}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              Top-Selling Projects
            </CardTitle>
            <CardDescription>Best performing projects by sales and revenue.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {summaryQuery.isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-xl border p-4 bg-card">
                    <Skeleton className="h-5 w-40" />
                    <div className="mt-3 flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : summary?.topProjects?.length ? (
              <div className="divide-y divide-border/50">
                {summary.topProjects.map((project, index) => {
                  const maxRevenue = Math.max(...summary.topProjects.map(p => p.revenue), 1)
                  const progressPercentage = (project.revenue / maxRevenue) * 100
                  const isTopOne = index === 0

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={project.id || `${project.title}-${index}`}
                      className={`group relative p-4 transition-all duration-300 hover:bg-muted/30 ${isTopOne ? 'bg-primary/[0.02]' : 'bg-card'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm ${
                            isTopOne ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-muted text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-foreground truncate pr-4 group-hover:text-primary transition-colors">
                              {project.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                {project.salesCount.toLocaleString()} sales
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0 sm:min-w-[120px]">
                          <div className="font-bold text-foreground text-base tracking-tight">{formatCurrency(project.revenue)}</div>
                          <div className="w-full mt-2 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                              className={`h-full rounded-full ${isTopOne ? 'bg-amber-400' : 'bg-primary/60 group-hover:bg-primary'}`} 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 h-full min-h-[300px]">
                <FolderKanban className="w-12 h-12 mb-4 text-muted-foreground/30" />
                <p className="font-medium text-foreground">No top-selling projects yet</p>
                <p className="text-sm">When sales happen, your best projects will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Latest buyer activity from the dashboard summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : summary?.recentPurchases?.length ? (
              summary.recentPurchases.map((purchase) => (
                <div key={purchase.id || `${purchase.paymentId}-${purchase.purchaseDate}`} className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4">
                  <div className="min-w-0">
                    <div className="font-medium">{purchase.buyerName}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {purchase.projectTitle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {purchase.paymentId} • {formatDate(purchase.purchaseDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(purchase.amount)}</div>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClass(purchase.paymentStatus)}`}>
                      {purchase.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No recent purchases available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>
              Paginated purchase records from `/api/v1/admin/purchases`.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={(event) => event.preventDefault()}
              className="relative w-full lg:max-w-sm"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search buyer, project, or payment..."
                className="pl-9"
              />
            </form>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {purchasesQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {(purchasesQuery.error as Error)?.message || "Failed to load purchase history."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableColumns.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  {purchasesQuery.isLoading ? (
                    <TableBody>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: tableColumns.length }).map((__, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-4 w-full max-w-[140px]" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : purchases.length ? (
                    <PurchaseRows rows={purchases} />
                  ) : (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={tableColumns.length} className="py-12 text-center text-muted-foreground">
                          No purchases matched the current filters.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {purchases.length} of {totalRecords.toLocaleString()} purchases
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Prev
                  </Button>
                  <div className="rounded-md border px-3 py-2 text-sm">
                    Page {page} of {Math.max(totalPages, 1)}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Revenue Snapshot</CardTitle>
          <CardDescription>Quick roll-up from the admin summary endpoint.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {summaryQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))
          ) : (
            <>
              <div className="rounded-xl border border-border/60 bg-primary/[0.04] p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Revenue per Sale
                </div>
                <div className="mt-3 text-2xl font-bold">
                  {formatCurrency(
                    summary?.totalSales
                      ? (summary.totalRevenue || 0) / Math.max(summary.totalSales, 1)
                      : 0
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-primary/[0.04] p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  Revenue per Customer
                </div>
                <div className="mt-3 text-2xl font-bold">
                  {formatCurrency(
                    summary?.totalCustomers
                      ? (summary.totalRevenue || 0) / Math.max(summary.totalCustomers, 1)
                      : 0
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-primary/[0.04] p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FolderKanban className="h-4 w-4" />
                  Sales per Project Sold
                </div>
                <div className="mt-3 text-2xl font-bold">
                  {summary?.totalProjectsSold
                    ? (summary.totalSales / Math.max(summary.totalProjectsSold, 1)).toFixed(2)
                    : "0.00"}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
