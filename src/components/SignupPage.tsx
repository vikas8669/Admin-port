import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Rocket,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function Signup() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ email, password }))
      localStorage.setItem("isAuth", "true")

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }

      toast.success("Account Created Successfully 🎉")
      navigate("/admin")
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 bg-[length:400%_400%] animate-gradient" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE — SIGNUP FORM */}
        <div className="flex items-center justify-center px-6 py-10 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Enter your details to start your SaaS journey
                </CardDescription>
                <CardAction>
                  <Button
                    variant="link"
                    className="text-purple-400"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSignup}>
                  <div className="flex flex-col gap-6">

                    {/* Email */}
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        required
                        className="bg-white/20 border-white/20 text-white"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          className="bg-white/20 border-white/20 text-white pr-10"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        onCheckedChange={(checked) =>
                          setRememberMe(!!checked)
                        }
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-gray-300"
                      >
                        Remember me
                      </Label>
                    </div>
                  </div>

                  <CardFooter className="flex-col gap-3 px-0 mt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT SIDE — MARKETING CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col justify-center px-20"
        >
          <h1 className="text-5xl font-bold leading-tight">
            Build Your <span className="text-purple-500">SaaS</span> Today.
          </h1>

          <p className="mt-6 text-gray-400 max-w-md">
            Powerful dashboard tools, enterprise security,
            real-time analytics, and seamless scalability.
          </p>

          <div className="mt-10 space-y-6">
            <Feature icon={<BarChart3 />} text="Advanced Analytics Dashboard" />
            <Feature icon={<ShieldCheck />} text="Secure Authentication System" />
            <Feature icon={<MessageSquare />} text="Integrated Messaging System" />
            <Feature icon={<Rocket />} text="Blazing Fast Performance" />
          </div>

          <div className="mt-16 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <p className="text-gray-300 italic">
              “The perfect foundation for any SaaS startup.
              Beautiful, fast, and scalable.”
            </p>
            <p className="mt-4 text-purple-400 font-semibold">
              — SaaS Founder
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

function Feature({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-center gap-4 text-gray-300">
      <div className="p-2 bg-white/10 rounded-lg text-purple-400">
        {icon}
      </div>
      <p>{text}</p>
    </div>
  )
}
