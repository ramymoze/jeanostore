"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CartSidebar } from "@/components/cart-sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartSidebar />}
      {children}
    </>
  );
}
