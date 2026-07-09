import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = {
  title: "Admin Dashboard | Studio Photography",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </ToastProvider>
  );
}
