"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const publicRoutes = new Set(["/", "/how-it-works", "/pricing", "/docs", "/contact"]);

export default function SiteNavigation() {
  const pathname = usePathname();
  return publicRoutes.has(pathname) ? <Navbar /> : null;
}
