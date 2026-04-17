import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PopupLoaderProps {
  isOpen: boolean
  message?: string
}

export default function PopupLoader({ isOpen, message = "Processing..." }: PopupLoaderProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-4 bg-card px-8 py-6 rounded-2xl border shadow-2xl"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
