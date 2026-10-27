import Link from "next/link";
import NovaBurst from "@/components/NovaBurst";

const stats = [
  { num: "Gemini", label: "AI-powered answers" },
  { num: "Web", label: "search with sources" },
  { num: "Saved", label: "conversation history" },
];

export default function Hero() {
  return (
    <section className="max-w-[1200px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center px-5 sm:px-6 pt-10 sm:pt-16 lg:pt-[88px] pb-10 sm:pb-16">
      <div>
        <div className="inline-flex items-center gap-2 text-[12px] tracking-wide font-mono text-nova px-3 py-1.5 rounded-full border border-nova-soft bg-nova-soft mb-[22px] animate-[fadeUp_0.7s_ease-out_both]">
          <span className="w-1.5 h-1.5 rounded-full bg-flare animate-[pulse_1.8s_infinite]" />
          NOW IN PUBLIC BETA
        </div>

        <h1 className="font-display font-semibold text-[38px] sm:text-[48px] lg:text-[64px] leading-[1.04] tracking-tight mb-[22px] animate-[fadeUp_0.7s_0.08s_ease-out_both]">
          Reasoning that arrives <em className="not-italic text-nova">fully formed.</em>
        </h1>

        <p className="text-[17px] leading-relaxed text-mist max-w-[460px] mb-8 animate-[fadeUp_0.7s_0.16s_ease-out_both]">
          Ask questions, explore ideas, write, or work through code with Gemini.
          Nova keeps your conversations together and can ground answers in web
          sources when current information helps.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 mb-[38px] animate-[fadeUp_0.7s_0.24s_ease-out_both]">
          <Link
            href="/register"
            className="btn-primary inline-flex items-center justify-center gap-2 px-[22px] py-3.5 rounded-[10px] text-[14.5px] font-display font-semibold bg-ink text-bg hover:-translate-y-0.5 hover:shadow-nova transition-all"
          >
            Start building free
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-[22px] py-3.5 rounded-[10px] text-[14.5px] font-display font-semibold border border-line-strong hover:border-nova hover:bg-nova-soft transition-all"
          >
            Watch the demo →
          </a>
        </div>

        <div className="flex gap-7 flex-wrap animate-[fadeUp_0.7s_0.32s_ease-out_both]">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="font-display font-semibold text-[22px]">{s.num}</span>
              <span className="text-[12.5px] text-mist mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <NovaBurst />
    </section>
  );
}
