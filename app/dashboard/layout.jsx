import DashboardLogout from "@/components/admin/DashboardLogout";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <DashboardLogout />
    </>
  );
}
