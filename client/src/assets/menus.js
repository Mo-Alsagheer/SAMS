import {
  BookCopyIcon,
  CalendarDays,
  File,
  LayoutDashboardIcon,
  ListChecks,
  ListTodo,
  MapIcon,
} from "lucide-react";
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
import { MdOutlineManageAccounts } from "react-icons/md";
import { MdPersonOutline } from "react-icons/md";
import { MdOutlinePersonOutline } from "react-icons/md";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { LuListTodo } from "react-icons/lu";
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
    path: "taskManagement",
    name: "Task Management",
  },
  {
    icon: MdOutlineManageAccounts,
    path: "manageRoadmap",
    name: "Manage Roadmap",
  },
  {
    icon: MdOutlinePersonOutline,
    path: "members",
    name: "Members",
  },
  {
    icon: RiCalendarScheduleLine,
    path: "schedule",
    name: "Schedule Meeting",
  },
  {
    icon: LuListTodo,
    path: "taskSubmission",
    name: "Task Submission",
  },
  
];

export const executive = [
  { name: "Dashboard", path: "/executive", icon: LayoutDashboard },
  { name: "Committees", path: "/executive/committees", icon: BookOpen },
  { name: "Applications", path: "/executive/applications", icon: BookCopyIcon },
  { name: "Recruitment", path: "/executive/recruitment", icon: ClipboardList },
  { name: "Events", path: "/executive/events", icon: Calendar },
  { name: "Settings", path: "/executive/settings", icon: Settings },
];

export const membermenu = [
  { name: "DashBoard", path: "", icon: LayoutDashboard },
  {
    name: "RoadMap",
    path: "roadmap",
    icon: MapIcon,
  },
  { name: "My Tasks", path: "tasks", icon: ListChecks },
];
