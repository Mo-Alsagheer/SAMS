import { File, LayoutDashboardIcon, ListTodo } from "lucide-react";
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
