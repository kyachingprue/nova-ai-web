"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <div className="h-9 w-[144px] rounded-lg border border-line-strong bg-bg-elevated" />;
  }

  return (
    <label className="theme-select-wrap" title="Color theme">
      <span className="sr-only">Color theme</span>
      {theme === "light" ? <Sun size={15} /> : theme === "dark" ? <Moon size={15} /> : <Laptop size={15} />}
      <select aria-label="Color theme" className="theme-select" value={theme || "dark"} onChange={(event) => setTheme(event.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
