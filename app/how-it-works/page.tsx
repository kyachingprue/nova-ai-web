import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpenText, BrainCircuit, SearchCheck, Sparkles } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const stages = [
  {
    number: "01",
    icon: BookOpenText,
    title: "Ask in your own words",
    description: "Start with a question, a half-formed thought, or something you want to understand. No special syntax or prompt tricks required.",
  },
  {
    number: "02",
    icon: SearchCheck,
    title: "Nova finds fresh context",
    description: "Gemini reasons over your conversation and searches the web for relevant, current information when it helps answer your question.",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "Get a useful answer",
    description: "Read a clear response, open its source links, and follow up. Your messages and research sources stay together in chat history.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <AmbientBackground />
      <main className="relative">
        <section className="how-page-hero">
          <span className="pricing-pill"><Sparkles size={13} /> A LITTLE MORE CLARITY, EVERY DAY</span>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">From curious question<br /><span className="text-nova">to clear next step.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mist">Nova brings Gemini, web search, and your conversation history together in one calm workspace. Here’s how it works.</p>
          <a href="#steps" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-nova">See the three steps <ArrowDown size={16} /></a>
        </section>
        <section id="steps" className="how-stage-section">
          <div className="how-stage-grid">
            {stages.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="how-stage-card">
                <div className="flex items-center justify-between"><span className="font-mono text-xs tracking-widest text-nova">STEP {number}</span><span className="how-stage-icon"><Icon size={20} /></span></div>
                <h2 className="mt-8 font-display text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>
                <div className="mt-7 h-px bg-line" />
                <span className="mt-4 block font-mono text-[10px] tracking-wide text-mist">{number} <ArrowRight className="ml-1 inline" size={12} /></span>
              </article>
            ))}
          </div>
        </section>
        <HowItWorks />
        <section className="how-grounding">
          <div className="how-grounding-orb"><SearchCheck size={25} /></div>
          <div><p className="eyebrow">ANSWERS WITH CONTEXT</p><h2 className="mt-2 font-display text-2xl font-semibold">Research you can follow up on.</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">When web search supports an answer, Nova saves its source links with the conversation. Revisit the chat later and the research is still there.</p></div>
          <Link className="how-grounding-link" href="/docs">Explore the docs <ArrowRight size={15} /></Link>
        </section>
        <section className="route-cta">
          <h2 className="font-display text-3xl font-semibold">Ready to think out loud?</h2>
          <p className="mt-3 text-sm text-mist">Start a conversation with Nova. It’s free to get started.</p>
          <Link href="/pricing" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-nova px-5 text-sm font-semibold text-white hover:brightness-110">Explore plans <ArrowRight size={16} /></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
