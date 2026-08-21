import DashboardLogout from "@/components/admin/DashboardLogout";

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <DashboardLogout />
    </>
  );
}
