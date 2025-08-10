import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/header/admin-header";
import { AdminSidebar } from "@/components/sidebar/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col relative">
          <AdminHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
