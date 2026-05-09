import DashboardLayout from "@/layout/DashBoardLayout";
import { Outlet } from "react-router-dom";
import { getInitials } from "@/utils/getInitials";
import { getCurrentUser } from "@/features/auth/session";

function DirectorLayout() {
  const user = getCurrentUser();

  const name = user?.name || "";
  const initials = getInitials(name || "EX");

  return (
    <DashboardLayout
      title={"Director Dashboard"}
      subtitle={"manage all operations"}
      userInitials={initials}
      role={"director"}
      name={name}
    >
      <main>
        <Outlet />
      </main>
    </DashboardLayout>
  );
}

export default DirectorLayout;