import { File, LayoutDashboardIcon, ListTodo } from "lucide-react";
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
import { VscRequestChanges } from "react-icons/vsc";
export const directormenu = [
  {
    icon: LayoutDashboardIcon,
    path: "",
    name: "Dashboard",
  },
  {
    icon: VscRequestChanges,
    path: "applications",
    name: "Applications",
  },
  {
    icon: File,
    path: "workspace",
    name: "WorkSpace",
  },
  {
    icon: ListTodo,
    path: "tasks",
    name: "Tasks",
  },
];

export const executive = [
  { name: "Dashboard", path: "/executive", icon: LayoutDashboard },
  { name: "Committees", path: "/executive/committees", icon: BookOpen },
  { name: "Recruitment", path: "/executive/recruitment", icon: ClipboardList },
  { name: "Events", path: "/executive/events", icon: Calendar },
  { name: "Settings", path: "/executive/settings", icon: Settings },
];
