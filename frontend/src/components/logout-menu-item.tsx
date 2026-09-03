"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function LogoutMenuItem() {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // The local redirect still returns the user to a safe screen.
    }
    router.replace("/?msg=logout_success");
  };

  return (
    <DropdownMenuItem
      className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Keluar</span>
    </DropdownMenuItem>
  );
}
