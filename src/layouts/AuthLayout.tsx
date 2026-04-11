"use client"

import { motion } from "framer-motion"
// import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute w-96 h-96 bg-purple-600/30 blur-3xl rounded-full top-20 left-20" />
      <div className="absolute w-96 h-96 bg-blue-600/30 blur-3xl rounded-full bottom-20 right-20" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  )
}
