"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, CreditCard } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
} from "recharts"


/* ===============================
   📊 STATIC DATA (TOP OPTIMIZED)
================================= */

const weeklyData = [
  { name: "Mon", revenue: 1200 },
  { name: "Tue", revenue: 2100 },
  { name: "Wed", revenue: 1800 },
  { name: "Thu", revenue: 2400 },
  { name: "Fri", revenue: 2800 },
]

const monthlyData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4780 },
  { name: "May", revenue: 5890 },
  { name: "Jun", revenue: 6390 },
]

const yearlyData = [
  { name: "2022", revenue: 32000 },
  { name: "2023", revenue: 45000 },
  { name: "2024", revenue: 52000 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
}

/* ===============================
   🔢 Animated Counter (Optimized)
================================= */

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

/* ===============================
   🚀 HERO DASHBOARD
================================= */

const Hero = () => {
  const [filter, setFilter] = React.useState<"Week" | "Month" | "Year">("Month")

  /* 🔥 Memoized Data (Performance Boost) */
  const data = React.useMemo(() => {
    switch (filter) {
      case "Week":
        return weeklyData
      case "Year":
        return yearlyData
      default:
        return monthlyData
    }
  }, [filter])

  return (
    <div className="space-y-8">

      {/* ================= KPI CARDS ================= */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }}>
          <Card className="relative overflow-hidden border shadow-md hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Current period</CardDescription>
              </div>
              <TrendingUp className="text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                $<AnimatedNumber value={52890} />
              </p>
              <p className="text-sm text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }}>
          <Card className="relative overflow-hidden border shadow-md hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Live users</CardDescription>
              </div>
              <Users className="text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                <AnimatedNumber value={1248} />
              </p>
              <p className="text-sm text-muted-foreground">
                +8.2% growth
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscriptions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }}>
          <Card className="relative overflow-hidden border shadow-md hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>New signups</CardDescription>
              </div>
              <CreditCard className="text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                <AnimatedNumber value={320} />
              </p>
              <p className="text-sm text-muted-foreground">
                +15% increase
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ================= CHART SECTION ================= */}

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Performance overview</CardDescription>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {["Week", "Month", "Year"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item as any)}
                className={`px-3 py-1 rounded-md text-sm border transition-all ${
                  filter === item
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ChartContainer
                config={chartConfig}
                className="h-[350px] w-full"
              >
                <LineChart data={data}>
                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={3}
                    dot={({ cx, cy }) => (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="white"
                        stroke="var(--color-revenue)"
                        strokeWidth={3}
                        className="drop-shadow-md"
                      />
                    )}
                    activeDot={{
                      r: 8,
                      stroke: "var(--color-revenue)",
                      strokeWidth: 3,
                      fill: "white",
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

export default Hero
