import { Outlet } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import PageTransition from "@/components/PageTransition"
import { AppSidebar } from "./Sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbList,

} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ThemeToggle from "@/components/ThemeToggle"
import NotificationBell from "@/components/NotificationBell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardLayout() {
  const storedUser = localStorage.getItem("user")
  const parsedUser = storedUser ? JSON.parse(storedUser) : null

  const realUser = {
    name: parsedUser?.username || "User",
    email: parsedUser?.email || "No Email",
    avatar: "/avatars/shadcn.jpg", 
  }
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 h-4 hidden md:block"
            />

            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <ThemeToggle />
            
            <div className="flex items-center gap-3 border-l pl-4 border-border/50">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{realUser.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{realUser.email}</span>
              </div>
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                <AvatarImage src={realUser.avatar} alt={realUser.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {realUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* 🔥 MAIN CONTENT WRAPPED IN TRANSITION */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
