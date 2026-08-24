import DashboardLogout from "@/components/admin/DashboardLogout";
import DashboardBodyClass from "@/components/admin/DashboardBodyClass";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return (
    <>
      <DashboardBodyClass />
      {children}
      <DashboardLogout />
    </>
  );
}
