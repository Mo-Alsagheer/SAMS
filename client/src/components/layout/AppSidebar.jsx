import {
  LayoutDashboard,
  Users,
  Shield,
  ClipboardList,
  BookOpen,
  MessageSquare,
  Trophy,
  Calendar,
  Settings,
  GraduationCap,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

export default function AppSidebar({ role, navItems }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>

          {!collapsed && (
            <span className="font-display font-bold text-sidebar-foreground text-lg">
              IEEE
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="capitalize">{role}</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    {/* <NavLink
                      to={item.path}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink> */}
                    <NavLink
                      to={item.path}
                      end
                      className={({ isActive }) =>
                        `hover:bg-sidebar-accent/50 ${isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}`
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
