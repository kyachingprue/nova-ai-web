import Reveal from "@/components/Reveal";

const steps = [
  {
    index: "01 — ASK",
    title: "Start with a question",
    desc: "Ask in your own words, whether you need help understanding a topic, drafting something, or exploring an idea.",
  },
  {
    index: "02 — EXPLORE",
    title: "Gemini works through it",
    desc: "Nova sends your conversation to Gemini and can use web search when fresh context could make the answer more useful.",
  },
  {
    index: "03 — KEEP",
    title: "Save what matters",
    desc: "Your conversation is saved with timestamps. When web results are used, source links stay attached to the answer.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="py-16 sm:py-20 lg:py-[100px] px-5 sm:px-6 bg-bg-elevated border-t border-b border-line"
    >
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="max-w-[640px] mb-14">
          <div className="inline-flex text-[12px] font-mono tracking-wide text-nova px-3 py-1.5 rounded-full border border-nova-soft bg-nova-soft mb-4">
            FROM QUESTION TO ANSWER
          </div>
          <h2 className="font-display font-semibold text-[28px] sm:text-[34px] lg:text-[40px] tracking-tight leading-[1.15] mb-3.5">
            From a question to a useful answer.
          </h2>
          <p className="text-mist text-base leading-relaxed">
            A simple flow: ask, explore the answer, and pick up the conversation whenever you need it.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
          {steps.map((s) => (
            <Reveal key={s.index}>
              <div className="relative pt-5">
                <span className="absolute top-0 left-0 w-8 h-px bg-line-strong" />
                <span className="block text-[13px] font-mono text-nova mb-3.5">
                  {s.index}
                </span>
                <h3 className="font-display font-semibold text-[19px] mb-2.5">
                  {s.title}
                </h3>
                <p className="text-mist text-[14.5px] leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
