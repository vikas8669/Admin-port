"use client"

import * as React from "react"
import { motion } from "framer-motion"
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
  // ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import { getContacts } from "@/context/Contact"
import { TrendingUp, Users, CreditCard, Globe } from "lucide-react"

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
  const growthPercent = data?.growthPercent
  const devices = data?.devices || {}
  const browsers = data?.browsers || {}

  const growthColor =
    growthPercent && growthPercent > 0 ? "text-green-400" : "text-red-400"

  const badgeVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
    }),
  }

  const lineColor = "#6366f1"
  const dotStrokeColor = "#6366f1"

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ================= KPI Cards ================= */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Contacts */}
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Card className="shadow-lg hover:shadow-xl border transition-all ">
            <CardHeader className="flex justify-between items-start ">
              <div>
                <CardTitle>Total Contacts</CardTitle>
                <CardDescription>All submissions</CardDescription>
              </div>
              <Users className="w-6 h-6 text-gray-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-10 w-24" /> : <p className="text-3xl font-bold"><AnimatedNumber value={totalContacts} /></p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* Growth % */}
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Card className="shadow-lg hover:shadow-xl">
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle>Growth %</CardTitle>
                <CardDescription>Compared to last period</CardDescription>
              </div>
              <TrendingUp className="w-6 h-6 text-gray-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-10 w-16" /> : <p className={`text-3xl font-bold ${growthColor}`}>{growthPercent ?? "-"}%</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* Devices */}
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Card className="shadow-lg hover:shadow-xl">
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle>Devices</CardTitle>
                <CardDescription>Used by users</CardDescription>
              </div>
              <CreditCard className="w-6 h-6 text-gray-600" />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isLoading
                ? Array(2).fill(0).map((_, idx) => <Skeleton key={idx} className="h-6 w-16 rounded-full" />)
                : Object.entries(devices).length > 0
                ? Object.entries(devices).map(([device, count]: any, idx) => (
                    <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={badgeVariants} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-800 flex items-center justify-center transition-all duration-300">
                      {device}: {count}
                    </motion.div>
                  ))
                : <span className="text-gray-400">No data</span>
              }
            </CardContent>
          </Card>
        </motion.div>

        {/* Browsers */}
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Card className="shadow-lg hover:shadow-xl">
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle>Browsers</CardTitle>
                <CardDescription>Used by users</CardDescription>
              </div>
              <Globe className="w-6 h-6 text-gray-600" />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isLoading
                ? Array(2).fill(0).map((_, idx) => <Skeleton key={idx} className="h-6 w-16 rounded-full" />)
                : Object.entries(browsers).length > 0
                ? Object.entries(browsers).map(([browser, count]: any, idx) => (
                    <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={badgeVariants} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-800 flex items-center justify-center transition-all duration-300">
                      {browser}: {count}
                    </motion.div>
                  ))
                : <span className="text-gray-400">No data</span>
              }
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ================= Chart ================= */}
      <Card className="shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Contact Analytics</CardTitle>
            <CardDescription>Based on submissions</CardDescription>
          </div>

          <div className="flex gap-2">
            {["Week", "Month", "Year"].map((item) => (
              <button key={item} onClick={() => setFilter(item as any)} className={`px-3 py-1 rounded-md text-sm border transition-colors duration-200 ${filter === item ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {item}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="min-h-[350px] flex items-center justify-center">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-md" />
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
              <span className="text-4xl mb-2">📊</span>
              <span>No analytics data available</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={lineColor}
                  strokeWidth={3}
                  dot={({ cx, cy }) => (
                    <circle cx={cx} cy={cy} r={6} fill="white" stroke={dotStrokeColor} strokeWidth={3} className="drop-shadow-md" />
                  )}
                  activeDot={{ r: 8, stroke: dotStrokeColor, strokeWidth: 3, fill: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
})

Hero.displayName = "Hero"
export default Hero