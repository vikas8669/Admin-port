"use client"

import * as React from "react"
import {
  Bot,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const storedUser = localStorage.getItem("user")
  const parsedUser = storedUser ? JSON.parse(storedUser) : null

  const realUser = {
    name: parsedUser?.username || "User",
    email: parsedUser?.email || "No Email",
    avatar: "/avatars/shadcn.jpg", // you can keep static avatar or dynamic later
  }

  const data = {
    user: realUser,
    teams: [
      {
        name: "Bom x",
        logo: GalleryVerticalEnd,
        plan: "Web service",
        url: "/",
      },
    ],
    navMain: [
      {
        title: "Blog Management",
        icon: SquareTerminal,
        isActive: true,
        items: [
          { title: "All Posts", url: "/admin/posts" },
          { title: "Add New Post", url: "/admin/posts/new" },
          { title: "Categories", url: "/admin/categories" },
        ],
      },
      {
        title: "Contact Management",
        icon: Bot,
        items: [
          { title: "All Messages", url: "/admin/messages" },
          { title: "Unread", url: "/admin/messages/unread" },
          { title: "Replied", url: "/admin/messages/replied" },
        ],
      },
    ],
    projects: [
      {
        name: "All Projects",
        url: "#",
        icon: Frame,
      },
      {
        name: "Add Project",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Categories",
        url: "#",
        icon: Map,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}