import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Rocket, BarChart3, ShieldCheck, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/context/Login";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").regex(/^[\w-.]+@gmail\.com$/, "Only Gmail allowed"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "", rememberMe: false },
    });

    const loginMutation = useLogin();

    const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 bg-[length:400%_400%] animate-gradient" />
            <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:flex flex-col justify-center px-10 xl:px-20"
                >
                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight">
                        Scale Your <span className="text-purple-500">SaaS</span> Faster.
                    </h1>
                    <p className="mt-6 text-gray-400 max-w-md text-sm md:text-base">
                        All-in-one dashboard solution with analytics, content management, and enterprise-ready architecture.
                    </p>
                    <div className="mt-10 space-y-6">
                        <Feature icon={<BarChart3 />} text="Advanced Analytics Dashboard" />
                        <Feature icon={<ShieldCheck />} text="Secure Authentication System" />
                        <Feature icon={<MessageSquare />} text="Integrated Messaging System" />
                        <Feature icon={<Rocket />} text="Blazing Fast Performance" />
                    </div>
                </motion.div>

                <div className="flex items-center justify-center px-4 sm:px-6 py-10 lg:py-0">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-md"
                    >
                        <Card className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-xl sm:text-2xl text-white">Login to your account</CardTitle>
                                <CardDescription className="text-gray-300 text-sm">Enter your email below to login</CardDescription>
                                {/* <CardAction>
                                    <Button variant="link" className="text-purple-400 p-0 h-auto" onClick={() => navigate("/signup")}>
                                        Sign Up
                                    </Button>
                                </CardAction> */}
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="flex flex-col gap-5">
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <Input type="email" placeholder="example@gmail.com" {...register("email")} className="bg-white/20 border-white/20 text-white" />
                                            {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Password</Label>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="Enter password" {...register("password")} className="bg-white/20 border-white/20 text-white pr-10" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox {...register("rememberMe")} />
                                            <Label className="text-sm text-gray-300">Remember me</Label>
                                        </div>
                                    </div>
                                    <CardFooter className="flex-col gap-3 px-0 mt-6">
                                        <Button type="submit" disabled={loginMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                                            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {loginMutation.isPending ? "Logging in..." : "Login"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-4 text-gray-300 text-sm md:text-base">
            <div className="p-2 bg-white/10 rounded-lg text-purple-400">{icon}</div>
            <p>{text}</p>
        </div>
    );
}
