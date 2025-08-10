import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="z-50 sticky top-0 left-0 flex items-center justify-between px-6 py-4 bg-background border-b border-solid">
      <div className="flex items-center gap-4 w-full">
        <SidebarTrigger />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2  h-4 w-4" />
          <Input placeholder="Search..." className="pl-10 w-64 " />
        </div>
        <div className="ml-auto">
          {/* <NotificationProvider>
            <NotificationBell />
          </NotificationProvider> */}
        </div>
      </div>
    </header>
  );
}
