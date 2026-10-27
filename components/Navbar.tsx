"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, X } from "lucide-react";
import { toast } from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";

const links = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Contact" },
];

type User = { firstName: string; lastName: string; email: string; imageUrl?: string | null };
type NavLink = (typeof links)[number];

function isNavLinkActive(link: NavLink, pathname: string) {
  if (link.label === "Pricing") return pathname === "/pricing";
  return pathname === link.href;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;
        const result = await response.json();
        return result.user as User | null;
      })
      .then((account) => {
        if (active) setUser(account);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out.");
      setUser(null);
      setAccountMenuOpen(false);
      toast.success("You’ve been signed out.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-line bg-[var(--nav-bg)] backdrop-blur-lg">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-6 sm:py-[18px]">
          <Link href="/" aria-label="Nova AI home" className="flex items-center gap-0 font-display text-[19px] font-semibold tracking-tight sm:gap-2.5">
            <BrandMark size={34} />
            <span className="hidden sm:inline">Nova AI</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1 rounded-full border border-line bg-bg/50 p-1">
          {links.map((link) => {
            const isActive = isNavLinkActive(link, pathname);
            return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={() => {
                setMenuOpen(false);
              }}
              onMouseEnter={() => router.prefetch(link.href)}
              onFocus={() => router.prefetch(link.href)}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[13px] transition-all duration-200 ${
                isActive
                  ? "bg-nova-soft font-semibold text-nova shadow-sm"
                  : "text-ink-soft hover:bg-nova-soft/60 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
            );
          })}
          </div>

          <div className="flex items-center gap-4.5 gap-[18px]">
          <ThemeToggle />
          {user ? (
            <div className="account-nav" ref={accountMenuRef}>
              <Link href="/dashboard" aria-label="Open dashboard" title="Dashboard" className="dashboard-shortcut">
                <LayoutDashboard size={17} />
              </Link>
              <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="account-trigger"
              >
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="account-avatar-image" />
                ) : (
                  <span className="account-avatar-fallback">{initials || "N"}</span>
                )}
                <ChevronDown size={14} className="hidden text-mist sm:block" />
              </button>
              {accountMenuOpen && (
                <div className="account-popover">
                  <div className="account-popover-user">
                    <strong>{user.firstName} {user.lastName}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link href="/dashboard" className="account-popover-link" onClick={() => setAccountMenuOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button type="button" className="account-popover-link" onClick={() => void logout()}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center gap-2 px-[22px] py-[11px] rounded-[10px] text-[14.5px] font-semibold border border-line-strong hover:border-nova hover:bg-nova-soft transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="navbar-cta inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] px-3.5 py-2 text-xs font-semibold sm:min-h-11 sm:px-4 sm:py-2.5 sm:text-sm md:px-5 lg:px-[22px] lg:py-[11px] lg:text-[14.5px]"
              >
                Get started
              </Link>
            </>
          )}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong sm:hidden"
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M0 1H16M0 6H16M0 11H16" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        </nav>
      </header>
      <div
        className={`fixed inset-0 z-[110] sm:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          visibility: menuOpen ? "visible" : "hidden",
          transition: menuOpen
            ? "opacity 300ms ease, visibility 0s"
            : "opacity 300ms ease, visibility 0s linear 300ms",
        }}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-[2px]"
        />
        <aside
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`absolute right-0 top-0 flex h-screen h-[100dvh] w-[min(88vw,380px)] flex-col border-l border-line bg-[var(--bg-elevated)] shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 font-display text-lg font-semibold">
              <BrandMark size={28} />
              Nova AI
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong text-ink-soft transition hover:bg-nova-soft hover:text-nova"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <p className="mb-3 px-3 font-mono text-[11px] tracking-[0.14em] text-mist">MENU</p>
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = isNavLinkActive(link, pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    onClick={() => setMenuOpen(false)}
                    onFocus={() => router.prefetch(link.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-xl px-4 py-3.5 text-base transition-colors ${
                      isActive
                        ? "bg-nova-soft font-semibold text-nova"
                        : "text-ink-soft hover:bg-nova-soft/60 hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {user ? (
              <div className="mt-7 flex flex-col gap-2 border-t border-line pt-5">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base text-ink-soft hover:bg-nova-soft/60"><LayoutDashboard size={18} /> Dashboard</Link>
                <button type="button" onClick={() => { setMenuOpen(false); void logout(); }} className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-base text-ink-soft hover:bg-nova-soft/60"><LogOut size={18} /> Sign out</button>
              </div>
            ) : (
              <div className="mt-7 flex flex-col gap-3 border-t border-line pt-5">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-center rounded-xl border border-line-strong text-base font-semibold text-ink-soft transition hover:border-nova hover:bg-nova-soft">Sign in</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="navbar-cta flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-semibold">Get started</Link>
              </div>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
}
