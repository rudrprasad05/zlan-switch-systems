import { Cable, Cake, Power, Wrench } from "lucide-react";

export function SidebarLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary ">
        <Cable className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold ">Switch Systems</span>
        <span className="text-xs text-gray-500">Admin Panel</span>
      </div>
    </div>
  );
}

export function PostSidebarLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
        <Wrench className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">Crumb Code</span>
        <span className="text-xs text-gray-500">Post Panel</span>
      </div>
    </div>
  );
}
