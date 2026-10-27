import Link from "next/link";
import { ArrowRight, BookOpen, CircleHelp, Code2, Database, KeyRound, Search, ShieldCheck, Sparkles } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";

const sections = [
  { id: "getting-started", number: "01", title: "Getting started", icon: Sparkles, text: "Create an account with your email and password, then enter the verification code sent to your inbox. Google sign-in is also available when Firebase is configured.", bullets: ["Choose a plan to get started (billing is not enabled yet).", "Verify your email address to activate your account.", "Open the dashboard to start a conversation."] },
  { id: "chat", number: "02", title: "Chat with Nova", icon: BookOpen, text: "Send a question from the dashboard. Nova uses Google Gemini to generate a response, with web search grounding enabled to find current information.", bullets: ["Use a new conversation for a separate topic.", "Conversation messages and timestamps are saved to your account.", "If web results are used, source links appear below Nova’s response."] },
  { id: "history", number: "03", title: "Chat history & sources", icon: Search, text: "Your recent conversations are listed in the dashboard sidebar. Select one to reopen its saved messages and citations.", bullets: ["History is private to your signed-in account.", "Saved messages and their sources are persisted in PostgreSQL.", "Conversation titles are generated from your first message."] },
  { id: "account", number: "04", title: "Profile & appearance", icon: ShieldCheck, text: "Your account menu in the top navigation links to the dashboard and lets you sign out. Choose a color preference from the theme control.", bullets: ["Upload an optional profile photo during registration.", "Choose light, dark, or system theme.", "Sessions use a signed, HTTP-only cookie."] },
];

const envGroups = [
  { icon: Database, title: "Database", variables: ["DATABASE_URL"] },
  { icon: KeyRound, title: "Authentication & email", variables: ["JWT_SECRET", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"] },
  { icon: Code2, title: "AI & integrations", variables: ["GEMINI_API_KEY", "GEMINI_MODEL (optional)", "NEXT_PUBLIC_FIREBASE_*", "NEXT_PUBLIC_IMGBB_API_KEY (optional)"] },
];

export default function DocsPage() {
  return (
    <>
      <AmbientBackground />
      <main className="relative">
        <section className="docs-hero">
          <span className="pricing-pill"><BookOpen size={13} /> NOVA AI DOCUMENTATION</span>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-6xl">Everything you need<br /><span className="text-nova">to get into the flow.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mist">A practical guide to your account, AI chats, source history, and configuring a Nova AI deployment.</p>
          <a href="#getting-started" className="docs-search"><Search size={17} /><span>Jump to getting started…</span><kbd>↵</kbd></a>
        </section>
        <div className="docs-layout">
          <aside className="docs-toc">
            <p className="sidebar-section-label !mx-0 !mt-0">ON THIS PAGE</p>
            {sections.map((section) => <a key={section.id} href={`#${section.id}`}><span>{section.number}</span>{section.title}</a>)}
            <a href="#configuration"><span>05</span>Configuration</a>
            <a href="#api"><span>06</span>API reference</a>
          </aside>
          <div className="docs-content">
            {sections.map(({ id, number, title, icon: Icon, text, bullets }) => (
              <section key={id} id={id} className="docs-section">
                <span className="docs-section-icon"><Icon size={19} /></span>
                <p className="eyebrow mt-5">GUIDE {number}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{title}</h2>
                <p className="mt-3 text-base leading-relaxed text-mist">{text}</p>
                <ul className="docs-bullets">{bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              </section>
            ))}
            <section id="configuration" className="docs-section">
              <span className="docs-section-icon"><Database size={19} /></span>
              <p className="eyebrow mt-5">DEPLOYMENT</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Configuration</h2>
              <p className="mt-3 text-base leading-relaxed text-mist">Copy <code>.env.example</code> to <code>.env.local</code> and configure the service credentials required for the features you want to enable. Keep server secrets private and never use a <code>NEXT_PUBLIC_</code> prefix for server-only values.</p>
              <div className="env-groups">{envGroups.map(({ icon: Icon, title, variables }) => <article key={title} className="env-group"><h3><Icon size={16} />{title}</h3><ul>{variables.map((variable) => <li key={variable}><code>{variable}</code></li>)}</ul></article>)}</div>
            </section>
            <section id="api" className="docs-section">
              <span className="docs-section-icon"><Code2 size={19} /></span>
              <p className="eyebrow mt-5">DEVELOPER REFERENCE</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">API reference</h2>
              <p className="mt-3 text-base leading-relaxed text-mist">The application’s Next.js route handlers power authentication and chat. Authenticated endpoints require the Nova session cookie; request validation errors return JSON with an <code>error</code> message.</p>
              <div className="api-list">
                <div><span className="api-method">POST</span><code>/api/auth/register</code><span>Start email verification</span></div>
                <div><span className="api-method">POST</span><code>/api/auth/verify</code><span>Verify code and create account</span></div>
                <div><span className="api-method">POST</span><code>/api/auth/login</code><span>Sign in with email/password</span></div>
                <div><span className="api-method">GET</span><code>/api/conversations</code><span>List your conversations</span></div>
                <div><span className="api-method">POST</span><code>/api/chat</code><span>Save a message and get a Gemini response</span></div>
              </div>
              <p className="mt-4 text-base leading-relaxed text-mist">Responses depend on your configured Neon, SMTP, Firebase, ImgBB, and Gemini services. See the project <Link className="text-nova underline underline-offset-2" href="/">home page</Link> or <Link className="text-nova underline underline-offset-2" href="/pricing">pricing</Link>.</p>
            </section>
            <div className="docs-help"><CircleHelp size={20} /><div><strong>Still have a question?</strong><p className="mt-1 text-base leading-relaxed text-mist">Review the project README for setup details and environment variable instructions.</p></div><Link href="/how-it-works" aria-label="How Nova works"><ArrowRight size={17} /></Link></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
