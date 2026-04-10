import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { directormenu, executive } from "@/assets/menus";
import AppSidebar from "@/components/layout/AppSidebar";
import ThemeToggle from "@/components/shared/theme-toggle";
import { clearAuthSession } from "@/features/auth/session";

const DashboardLayout = ({
  children,
  title,
  subtitle,
  userInitials,
  role,
  name,
}) => {
  const navigate = useNavigate();
  const roleNavs = {
    executive: executive,
    director: directormenu,
  };
  const navItems = roleNavs[role] || [];

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-accent w-full">
        <AppSidebar role={role} navItems={navItems} name={name} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className=" text-md md:text-lg font-medium md:font-semibold font-display">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  3
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
