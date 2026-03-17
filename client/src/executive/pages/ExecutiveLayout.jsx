import DashboardLayout from "@/layout/DashBoardLayout";
import { Outlet } from "react-router-dom";

function ExecutiveLayout() {
  return (
    <DashboardLayout
      title={"Executive Dashboard"}
      subtitle={"manage all operations"}
      userInitials={"Ex"}
      role={"executive"}
    >
      <main>
        <Outlet />
      </main>
    </DashboardLayout>
  );
}

export default ExecutiveLayout;
