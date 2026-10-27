import type { Metadata } from "next";
import { ArrowUpRight, Lightbulb, Mail, MessageCircle, WalletCards } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Nova AI",
  description: "Get in touch with the Nova AI team for product help, account questions, or feedback.",
};

const topics = [
  {
    icon: MessageCircle,
    title: "Product questions",
    description: "Ask about Nova AI, how it works, or getting started.",
  },
  {
    icon: WalletCards,
    title: "Account & billing",
    description: "Get help with your account, plan, or subscription.",
  },
  {
    icon: Lightbulb,
    title: "Ideas & feedback",
    description: "Share a suggestion or tell us what would make Nova better.",
  },
];

export default function ContactPage() {
  return (
    <>
      <AmbientBackground />
      <main className="min-h-[calc(100vh-80px)] px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-nova-soft bg-nova-soft px-3 py-1.5 font-mono text-xs tracking-wide text-nova">
              <Mail size={14} />
              WE&apos;RE HERE TO HELP
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Let&apos;s talk.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Questions, feedback, or just want to say hello? Send us a message and
              we&apos;ll be glad to hear from you.
            </p>
          </div>

          <section className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6" aria-label="Contact Nova AI">
            <div className="rounded-3xl border border-line bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow)] sm:p-10">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-nova-soft bg-nova-soft text-nova">
                <Mail size={22} />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Send us an email
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
                Tell us what you need help with. Include a little detail so we can
                point you in the right direction.
              </p>
              <a
                href="mailto:kyachingpruemarma5@gmail.com"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-base font-semibold text-bg transition hover:-translate-y-0.5 hover:shadow-nova"
              >
                Contact us
                <ArrowUpRight size={17} />
              </a>
              <a
                href="mailto:kyachingpruemarma5@gmail.com"
                className="mt-5 block break-all text-base font-medium text-nova transition hover:underline sm:text-lg"
              >
                kyachingpruemarma5@gmail.com
              </a>
            </div>

            <div className="rounded-3xl border border-line bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] p-7 sm:p-10">
              <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                How can we help?
              </h2>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                Reach out about any of these topics:
              </p>
              <ul className="mt-6 space-y-5">
                {topics.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-[var(--bg)] text-nova">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{title}</h3>
                      <p className="mt-1 text-base leading-relaxed text-mist">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
