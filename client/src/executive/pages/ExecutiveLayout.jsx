import DashboardLayout from "@/layout/DashBoardLayout";
import { Outlet } from "react-router-dom";
import { getInitials } from "@/utils/getInitials";
import { useEffect, useState } from "react";

function ExecutiveLayout() {
  const [initials, setInitials] = useState("EX");
  const [name, setName] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) {
      setName(user.name);
      setInitials(getInitials(user.name));
    }
  }, []);

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
