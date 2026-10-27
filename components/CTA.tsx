import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function CTA() {
  return (
    <section className="py-16 sm:py-20 lg:py-[100px] px-5 sm:px-6">
      <Reveal className="max-w-[1200px] mx-auto rounded-3xl px-6 sm:px-10 py-12 sm:py-[72px] text-center border border-line bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg)]">
        <h2 className="font-display font-semibold text-[28px] sm:text-[34px] lg:text-[42px] tracking-tight mb-4">
          Give your context a reasoning layer.
        </h2>
        <p className="text-mist mb-8">
          Free for individuals. No credit card required.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-[30px] py-3.5 rounded-[10px] text-[14.5px] font-display font-semibold bg-ink text-bg hover:-translate-y-0.5 hover:shadow-nova transition-all"
        >
          Start building free
        </Link>
      </Reveal>
    </section>
  );
}
