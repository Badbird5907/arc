"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";

export const AdminSidebarLogout = () => {
  return (
    <DropdownMenuItem onClick={() => {
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        window.location.href = "/";
      })
    }}>
      <span>Sign out</span>
    </DropdownMenuItem>
  )
}