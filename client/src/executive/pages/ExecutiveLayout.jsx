import DashboardLayout from "@/layout/DashBoardLayout";
import { Outlet } from "react-router-dom";
import { getInitials } from "@/utils/getInitials";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/features/auth/session";

function ExecutiveLayout() {

const user = getCurrentUser();

const name = user?.name || "";
const initials = getInitials(name || "EX");

  return (
    <DashboardLayout
      title={"Executive Dashboard"}
      subtitle={"manage all operations"}
      userInitials={initials}
      role={"executive"}
      name={name}
    >
      <main>
        <Outlet />
      </main>
    </DashboardLayout>
  );
}

export default ExecutiveLayout;
