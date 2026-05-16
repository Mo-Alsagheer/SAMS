import DashboardLayout from "@/layout/DashBoardLayout";
import { Outlet } from "react-router-dom";
import { getInitials } from "@/utils/getInitials";
import { getCurrentUser } from "@/features/auth/session";

function MemberLayout() {

const user = getCurrentUser();

const name = user?.name || "";
const initials = getInitials(name || "mm");

  return (
    <DashboardLayout
      title={"Member Dashboard"}
      subtitle={"view my progress"}
      userInitials={initials}
      role={"member"}
      name={name}
    >
      <main>
        <Outlet />
      </main>
    </DashboardLayout>
  );
}

export default MemberLayout;
