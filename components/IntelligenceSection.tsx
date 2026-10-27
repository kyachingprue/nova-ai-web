import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  BookOpenText,
  Braces,
  Globe2,
  PenLine,
  Sparkles,
} from "lucide-react";
import Reveal from "@/components/Reveal";

const capabilities = [
  {
    icon: Globe2,
    title: "Research with receipts",
    description: "Explore current topics with web-grounded answers and links you can open, check, and keep.",
    label: "WEB SEARCH",
  },
  {
    icon: PenLine,
    title: "Find the right words",
    description: "Draft a thoughtful email, reshape a rough idea, or make a complicated explanation feel simple.",
    label: "WRITING",
  },
  {
    icon: Braces,
    title: "Build and debug",
    description: "Work through code, understand an error, and turn a technical question into practical next steps.",
    label: "CODING",
  },
  {
    icon: BookOpenText,
    title: "Keep the whole thread",
    description: "Return to saved conversations with your messages, helpful answers, timestamps, and sources together.",
    label: "CHAT HISTORY",
  },
];

export default function IntelligenceSection() {
  return (
    <section className="intelligence-section">
      <div className="mx-auto max-w-[1120px]">
        <Reveal className="mb-12 max-w-2xl">
          <span className="pricing-pill"><Sparkles size={13} /> ONE ASSISTANT, MANY WAYS TO THINK</span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            From first draft to<br /><span className="text-nova">the next big idea.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
            Research, write, code, or simply think out loud. Nova brings Gemini and web search into a calm workspace that remembers the conversation.
          </p>
        </Reveal>

        <div className="intelligence-grid">
          {capabilities.map(({ icon: Icon, title, description, label }) => (
            <Reveal key={label}>
              <article className="intelligence-card">
                <div className="flex items-center justify-between">
                  <span className="intelligence-icon"><Icon size={18} /></span>
                  <span className="intelligence-label">{label}</span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="intelligence-prompt">
          <div className="intelligence-prompt-icon"><AudioLines size={18} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono tracking-widest text-nova">A GOOD PLACE TO BEGIN</p>
            <p className="mt-1 truncate text-sm text-ink-soft">“Help me understand this, and show me what to explore next.”</p>
          </div>
          <Link href="/register" aria-label="Get started with Nova AI" className="intelligence-prompt-link"><ArrowUpRight size={17} /></Link>
        </Reveal>
      </div>
    </section>
  );
}
