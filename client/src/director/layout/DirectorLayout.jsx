import DashboardLayout from "@/layout/DashBoardLayout";
import { Outlet } from "react-router-dom";
import { getInitials } from "@/utils/getInitials";
import { useEffect, useState } from "react";
import { getAuthUser } from "@/features/auth/session";
function DirectorLayout() {
  const [initials, setInitials] = useState("EX");
  const [name, setName] = useState("");
  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) {
      setName(user.name);
      setInitials(getInitials(user.name));
    }
  }, []);

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
