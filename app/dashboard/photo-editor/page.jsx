import PhotoEditor from "@/components/PhotoEditor";
import DashboardToolShell from "@/components/admin/DashboardToolShell";

export const metadata = {
  title: "Photo Editor",
  description: "Arrange, resize and rotate multiple images on a freeform canvas.",
};

export default function PhotoEditorPage() {
  return <DashboardToolShell activeHref="/dashboard/photo-editor"><PhotoEditor /></DashboardToolShell>;
}
