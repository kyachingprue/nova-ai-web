import Link from "next/link";
import { ArrowRight, BookOpen, House, MoveUpRight } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main className="relative flex min-h-[65vh] items-center justify-center overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(90vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
        >
          <div className="absolute inset-[10%] rounded-full border border-dashed border-line-strong" />
          <div className="absolute inset-[24%] rounded-full bg-[radial-gradient(circle,var(--nova-violet-soft),transparent_70%)]" />
        </div>

        <section className="mx-auto w-full max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nova-soft bg-nova-soft px-3 py-1.5 font-mono text-xs tracking-[0.12em] text-nova">
            <span className="h-1.5 w-1.5 rounded-full bg-flare" />
            SIGNAL NOT FOUND
          </span>
          <p
            aria-hidden="true"
            className="mt-5 bg-gradient-to-br from-nova via-[#a68cff] to-flare bg-clip-text font-display text-[clamp(7rem,28vw,15rem)] font-bold leading-[0.9] tracking-[-0.09em] text-transparent"
          >
            404
          </p>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Looks like you&apos;ve drifted off course.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            The page you&apos;re looking for isn&apos;t here. It may have moved,
            or the link might be out of date. Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="navbar-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold"
            >
              <House size={17} />
              Back to home
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/docs"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-[var(--bg-elevated)] px-6 text-base font-semibold text-ink-soft transition hover:border-nova hover:bg-nova-soft hover:text-nova"
            >
              <BookOpen size={17} />
              Explore the docs
              <MoveUpRight size={15} />
            </Link>
          </div>
          <p className="mt-8 font-mono text-xs tracking-wide text-mist">
            NOVA AI · YOUR NEXT IDEA IS JUST A CLICK AWAY
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
