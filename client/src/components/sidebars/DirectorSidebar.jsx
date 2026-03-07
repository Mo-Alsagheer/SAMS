import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { FileText, Calendar, User2, NewspaperIcon } from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: <FileText />, url: "/dashboard" },
  { title: "Applications", icon: <FileText />, url: "/applications" },
  { title: "Tasks", icon: <Calendar />, url: "/tasks" },
  { title: "Resources", icon: <Calendar />, url: "/resources" },
  { title: "Blog", icon: <NewspaperIcon />, url: "/blog" },
];

export default function DirectorSidebar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <Sidebar varriant="inset" collapsible="icon">
      {/* Header with trigger */}
      <SidebarHeader className="font-semibold flex justify-between items-center">
        <span>My Dashboard</span>
        <SidebarTrigger />
      </SidebarHeader>

      {/* Menu Content */}
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={() => toggle()} 
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User2 /> Profile
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
