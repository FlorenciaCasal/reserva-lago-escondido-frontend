import type { Metadata } from "next";
import { getAuthInfo } from "@/lib/auth";
import AdminSidebarClient from "@/components/AdminSidebarClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAdminLimit } = await getAuthInfo(); // SERVER SIDE ✔
  return (
    <AdminSidebarClient isAdmin={isAdmin} isAdminLimit={isAdminLimit}>
      {children}
    </AdminSidebarClient>
  );
}
