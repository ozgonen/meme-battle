"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";

export default function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button 
        variant="outline" 
        type="submit" 
        className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        Logout
      </Button>
    </form>
  );
} 