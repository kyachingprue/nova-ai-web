import { ArrowUp, Check, Globe2, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import BrandMark from "@/components/BrandMark";

export default function ConsoleDemo() {
  return (
    <section className="conversation-preview-section">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-nova-soft bg-nova-soft px-3 py-1.5 font-mono text-[11px] tracking-wide text-nova">
            <Sparkles size={13} /> A MORE NATURAL WAY TO ASK
          </div>
          <h2 className="mt-5 font-display text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[38px]">
            Good questions deserve clear answers.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">
            Ask in your own words. Get a useful response from Gemini, readable
            formatting for everything from a quick note to code, and web sources
            when search helps.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-ink-soft">
            <li className="flex items-center gap-2.5"><Check size={16} className="text-nova" />Your chat history stays in your workspace</li>
            <li className="flex items-center gap-2.5"><Check size={16} className="text-nova" />Copy formatted answers and code</li>
            <li className="flex items-center gap-2.5"><Check size={16} className="text-nova" />Open source links when web search is used</li>
          </ul>
        </Reveal>

        <Reveal>
          <div className="conversation-preview">
            <div className="conversation-preview-topbar">
              <span className="preview-brand"><BrandMark size={26} />Nova AI</span>
              <span className="preview-model"><span /> Gemini</span>
            </div>
            <div className="preview-chat">
              <div className="preview-user-message">
                <span className="preview-avatar-user">Y</span>
                <div><span className="preview-name">You</span><p>Can you explain neural networks in a simple way?</p></div>
              </div>
              <div className="preview-assistant-message">
                <span className="preview-avatar-ai"><Sparkles size={14} /></span>
                <div className="min-w-0 flex-1">
                  <span className="preview-name">Nova</span>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">Think of a neural network as a team learning to recognize patterns. Each member notices a small detail, then shares it with the next—until the whole team can make a useful guess.</p>
                  <div className="preview-insight"><Globe2 size={13} /><span>Clear explanation, ready for a follow-up</span></div>
                </div>
              </div>
            </div>
            <div className="preview-composer"><span>Ask Nova anything…</span><span className="preview-send"><ArrowUp size={15} /></span></div>
            <p className="preview-caption">A preview of the Nova chat experience</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
