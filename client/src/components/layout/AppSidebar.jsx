import { NavLink } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { LayoutDashboard, Users } from "lucide-react"

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon">

      <SidebarHeader className="p-4 font-bold text-lg">
        My App
      </SidebarHeader>

      <SidebarContent>

        <SidebarMenu>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/users">
                <Users />
                <span>Users</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarContent>

    </Sidebar>
  )
}