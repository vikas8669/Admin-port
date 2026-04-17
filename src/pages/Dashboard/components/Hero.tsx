"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { getContacts } from "@/context/Contact"
import { Users, TrendingUp, TrendingDown, Monitor, Globe, Activity } from "lucide-react"

const AnimatedNumber = React.memo(({ value }: { value: number }) => {
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    let start = 0
    const duration = 800
    const increment = value / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplay(value)
        clearInterval(counter)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(counter)
  }, [value])

  return <span>{display.toLocaleString()}</span>
})
AnimatedNumber.displayName = "AnimatedNumber"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

const Hero = React.memo(() => {
  const [filter, setFilter] = React.useState<"Week" | "Month" | "Year">("Month")

  const { data, isLoading } = useQuery<any>({
    queryKey: ["contacts", filter],
    queryFn: () => getContacts(filter),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const chartData = React.useMemo(() => {
    if (!data?.analytics?.length) return []
    if (data.analytics.length === 1) {
      return [
        { name: data.analytics[0].name, revenue: data.analytics[0].count },
        { name: "Next", revenue: data.analytics[0].count },
      ]
    }
    return data.analytics.map((item: any) => ({
      name: item.name || "Unknown",
      revenue: item.count || 0,
    }))
  }, [data])

  const totalContacts = data?.totalContacts || 0
  const growthPercent = data?.growthPercent || 0
  const devices = data?.devices || {}
  const browsers = data?.browsers || {}

  const isPositiveGrowth = growthPercent >= 0

  return (
    <div className="space-y-8 w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Analytics</h2>
          <p className="text-muted-foreground mt-1">Overview of your contacts and system performance.</p>
        </div>
        <div className="inline-flex items-center p-1 bg-muted rounded-lg border border-border/50 shadow-sm">
          {["Week", "Month", "Year"].map((item) => (
            <button 
              key={item} 
              onClick={() => setFilter(item as any)} 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === item 
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* Total Contacts */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Users className="w-16 h-16" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contacts</CardTitle>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-3xl font-bold tracking-tight"><AnimatedNumber value={totalContacts} /></span>
                  <span className="text-xs text-muted-foreground mt-1">All time submissions</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Growth % */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Activity className="w-16 h-16" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
              <div className={`p-2 rounded-full ${isPositiveGrowth ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {isPositiveGrowth ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{Math.abs(growthPercent)}%</span>
                    <span className={`text-sm font-medium ${isPositiveGrowth ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isPositiveGrowth ? '+' : '-'}{Math.abs(growthPercent)}%
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">From last {filter.toLowerCase()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Devices */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Monitor className="w-16 h-16" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Devices</CardTitle>
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-full">
                <Monitor className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(devices).length > 0 ? (
                    Object.entries(devices).map(([device, count]: any, idx) => (
                      <div key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        {device}: {count}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No data</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Browsers */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Globe className="w-16 h-16" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Browsers</CardTitle>
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-full">
                <Globe className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(browsers).length > 0 ? (
                    Object.entries(browsers).map(([browser, count]: any, idx) => (
                      <div key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        {browser}: {count}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No data</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle>Overview</CardTitle>
            <CardDescription>Contact submissions over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                  <Activity className="w-12 h-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No analytics data available</p>
                  <p className="text-sm">Try changing the time filter</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 8, strokeWidth: 0, fill: "#6366f1" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
})

Hero.displayName = "Hero"
export default Hero