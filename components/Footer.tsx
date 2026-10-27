import Link from "next/link";
import BrandMark from "@/components/BrandMark";

const columns = [
  {
    title: "PRODUCT",
    links: [
      { label: "Overview", href: "/#features" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "Home", href: "/" },
      { label: "Create account", href: "/register" },
      { label: "Sign in", href: "/login" },
      { label: "Docs", href: "/docs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Getting started", href: "/how-it-works" },
      { label: "Pricing plans", href: "/pricing" },
      { label: "Account", href: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="faq" className="border-t border-line py-14 px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-display font-semibold mb-3.5">
              <BrandMark size={26} />
              Nova AI
            </Link>
            <p className="text-mist text-sm max-w-[260px] leading-relaxed">
              Reasoning infrastructure for teams who need answers they can trace.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[13px] text-mist mb-4 tracking-wide">
                {col.title}
              </h4>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-[14.5px] text-ink-soft mb-[11px] hover:text-nova transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-7 border-t border-line text-[13px] text-mist flex-wrap gap-3">
          <span>© 2026 Nova AI, Inc.</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}
