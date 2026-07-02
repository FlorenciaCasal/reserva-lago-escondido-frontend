import { getAuthInfo } from "@/lib/auth";
import AdminSidebarClient from "@/components/AdminSidebarClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAdminLimit } = await getAuthInfo(); // SERVER SIDE ✔
  return (
    <AdminSidebarClient isAdmin={isAdmin} isAdminLimit={isAdminLimit}>
      {children}
    </AdminSidebarClient>
  );
}
