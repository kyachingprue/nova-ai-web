import Reveal from "@/components/Reveal";

type Feature = {
  title: string;
  desc: string;
  span: string;
  tag?: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Gemini for the way you think",
    desc: "Explore a question, draft a message, work through a tricky idea, or ask for help with code in one conversational workspace.",
    span: "lg:col-span-3",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1L11 7L17 9L11 11L9 17L7 11L1 9L7 7L9 1Z" fill="var(--nova-violet)" />
      </svg>
    ),
  },
  {
    title: "Web-grounded answers",
    desc: "When current information matters, Nova can search the web and show source links alongside Gemini's answer.",
    span: "lg:col-span-3",
    tag: "WITH SOURCES",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1" fill="var(--flare)" />
        <rect x="10" y="2" width="6" height="6" rx="1" fill="var(--nova-violet)" opacity="0.5" />
        <rect x="2" y="10" width="6" height="6" rx="1" fill="var(--nova-violet)" opacity="0.5" />
        <rect x="10" y="10" width="6" height="6" rx="1" fill="var(--flare)" />
      </svg>
    ),
  },
  {
    title: "A history that stays",
    desc: "Return to saved conversations with messages, timestamps, and research links together.",
    span: "lg:col-span-2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9H16M9 2V16" stroke="var(--nova-violet)" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "Readable, useful output",
    desc: "Get clear explanations, formatted writing, lists, and syntax-highlighted code.",
    span: "lg:col-span-2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6" stroke="var(--flare)" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "Your space, your theme",
    desc: "A responsive workspace with light, dark, and system appearance options.",
    span: "lg:col-span-2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 15L9 3L15 15" stroke="var(--nova-violet)" strokeWidth="1.6" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-[100px] px-5 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="max-w-[640px] mb-14">
          <div className="inline-flex text-[12px] font-mono tracking-wide text-nova px-3 py-1.5 rounded-full border border-nova-soft bg-nova-soft mb-4">
            CORE CAPABILITIES
          </div>
          <h2 className="font-display font-semibold text-[28px] sm:text-[34px] lg:text-[40px] tracking-tight leading-[1.15] mb-3.5">
            A helpful place to start thinking.
          </h2>
          <p className="text-mist text-base leading-relaxed">
            Ask in natural language and get a thoughtful Gemini response, with
            web sources and chat history available right in your workspace.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4.5 gap-[18px]">
          {features.map((f) => (
            <Reveal key={f.title} className={f.span}>
              <div className="relative h-full bg-bg-card border border-line rounded-2xl p-7 hover:-translate-y-1 hover:border-line-strong transition-transform">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-nova-soft flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[14.5px] text-mist leading-relaxed">{f.desc}</p>
                {f.tag && (
                  <span className="absolute top-6 right-6 text-[11px] text-flare bg-flare-soft px-2.5 py-1 rounded-full">
                    {f.tag}
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
