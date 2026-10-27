"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp, BookOpenText, Check, ChevronDown, CircleHelp, Clock3, Command, Copy, LoaderCircle,
  LogOut, Menu, MessageSquare, MoreHorizontal, Plus, Search, Sparkles, Trash2, X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandMark from "@/components/BrandMark";

type User = { firstName: string; lastName: string; email: string; imageUrl?: string | null };
type Conversation = { id: string; title: string; createdAt: string; updatedAt: string };
type Source = { url: string; title: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; sources: Source[]; createdAt: string };

const MessageContent = dynamic(() => import("@/components/chat/MessageContent"), {
  ssr: false,
  loading: () => null,
});

const starters = [
  { icon: Search, title: "Explore a new idea", prompt: "Help me explore an idea I've been thinking about…" },
  { icon: BookOpenText, title: "Make sense of a topic", prompt: "Explain a complex topic in a clear, practical way…" },
  { icon: Clock3, title: "Catch me up", prompt: "Give me a concise overview of the latest developments in…" },
];

function formatTime(date: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [openConversationMenu, setOpenConversationMenu] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRevision = useRef(0);
  const sendingConversationId = useRef<string | null>(null);

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/conversations");
    if (!response.ok) throw new Error("Unable to load your chat history.");
    const data = await response.json();
    setConversations(data.conversations);
    return data.conversations as Conversation[];
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const meResponse = await fetch("/api/auth/me");
        if (!meResponse.ok) {
          router.replace("/login");
          return;
        }
        const { user: account } = await meResponse.json();
        if (!active) return;
        setUser(account);
        await loadConversations();
      } catch {
        if (active) toast.error("Could not load your workspace.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, [loadConversations, router]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let active = true;
    const revisionAtRequest = messageRevision.current;
    fetch(`/api/conversations/${activeId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load this conversation.");
        return response.json();
      })
      .then((data) => {
        if (
          active &&
          revisionAtRequest === messageRevision.current &&
          sendingConversationId.current !== activeId
        ) {
          setMessages(data.messages);
        }
      })
      .catch(() => { if (active) toast.error("Unable to load this conversation."); });
    return () => { active = false; };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function startConversation() {
    try {
      const response = await fetch("/api/conversations", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start a chat.");
      setConversations((items) => [data.conversation, ...items]);
      messageRevision.current += 1;
      setActiveId(data.conversation.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start a chat.");
    }
  }

  async function deleteConversation(conversation: Conversation) {
    if (sendingConversationId.current === conversation.id) {
      toast.error("Wait for Nova to finish replying before deleting this conversation.");
      return;
    }

    setDeletingConversationId(conversation.id);
    setOpenConversationMenu(null);
    try {
      const response = await fetch(`/api/conversations/${conversation.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete this conversation.");

      setConversations((items) => items.filter((item) => item.id !== conversation.id));
      if (activeId === conversation.id) {
        messageRevision.current += 1;
        setActiveId("");
        setMessages([]);
      }
      toast.success("Conversation deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete this conversation.");
    } finally {
      setDeletingConversationId(null);
    }
  }

  async function sendMessage(text = draft) {
    const message = text.trim();
    if (!message || sending) return;
    let conversationId = activeId;
    if (!conversationId) {
      try {
        const response = await fetch("/api/conversations", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not start a chat.");
        conversationId = data.conversation.id;
        sendingConversationId.current = conversationId;
        setActiveId(conversationId);
        setConversations((items) => [
          { ...data.conversation, title: message.replace(/\s+/g, " ").slice(0, 64) },
          ...items.filter((item) => item.id !== data.conversation.id),
        ]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not start a chat.");
        return;
      }
    }
    setDraft("");
    setSending(true);
    const optimistic: ChatMessage = {
      id: `draft-${Date.now()}`, role: "user", content: message, sources: [], createdAt: new Date().toISOString(),
    };
    sendingConversationId.current = conversationId;
    messageRevision.current += 1;
    setMessages((items) => [...items, optimistic]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nova could not respond.");
      messageRevision.current += 1;
      setMessages((items) => [...items.filter((item) => item.id !== optimistic.id), {
        ...optimistic,
        createdAt: new Date().toISOString(),
      }, data.message]);
      setSending(false);
      try {
        await loadConversations();
      } catch {
        toast.error("Your answer is ready, but the conversation list could not be refreshed.");
      }
    } catch (error) {
      setDraft(message);
      toast.error(error instanceof Error ? error.message : "Nova could not respond.");
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (response.ok) {
          messageRevision.current += 1;
          setMessages((await response.json()).messages);
        }
      } catch {
        // Keep the visible draft if the history refresh also fails.
      }
    } finally {
      if (sendingConversationId.current === conversationId) {
        sendingConversationId.current = null;
      }
      setSending(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("You’ve been signed out.");
    router.replace("/");
    router.refresh();
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId((current) => current === message.id ? null : current), 1800);
    } catch {
      toast.error("Could not copy this message. Check clipboard permissions and try again.");
    }
  }

  const initials = `${user?.firstName?.[0] || "N"}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <main className="dashboard-shell">
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" className="auth-brand"><BrandMark />Nova AI</Link>
          <button className="mobile-sidebar-close" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <Button className="w-full justify-start" onClick={() => void startConversation()}><Plus size={17} /> New conversation <span className="ml-auto rounded-md border border-white/20 px-1.5 py-0.5 text-[10px] text-white/80">⌘ K</span></Button>
        <div className="sidebar-section-label">YOUR WORKSPACE</div>
        <button className="workspace-item"><span className="workspace-dot" />Personal workspace<ChevronDown size={14} className="ml-auto text-mist" /></button>
        <div className="sidebar-section-label mt-7">RECENT CONVERSATIONS</div>
        <div className="conversation-list">
          {loading && <div className="flex items-center gap-2 px-2 py-4 text-xs text-mist"><LoaderCircle size={14} className="animate-spin" />Loading chats…</div>}
          {!loading && conversations.length === 0 && <p className="px-2 py-3 text-xs leading-relaxed text-mist">Your conversations will appear here.</p>}
          {conversations.map((conversation) => (
            <div key={conversation.id} className={`conversation-row ${activeId === conversation.id ? "conversation-active" : ""}`}>
              <button
                type="button"
                onClick={() => {
                  if (activeId !== conversation.id) messageRevision.current += 1;
                  setActiveId(conversation.id);
                  setSidebarOpen(false);
                  setOpenConversationMenu(null);
                }}
                className="conversation-link"
              >
                <MessageSquare size={15} />
                <span>{conversation.title}</span>
              </button>
              <div className="conversation-actions">
                <button
                  type="button"
                  aria-label={`Conversation options for ${conversation.title}`}
                  aria-expanded={openConversationMenu === conversation.id}
                  className="conversation-menu-trigger"
                  disabled={deletingConversationId === conversation.id}
                  onClick={() => setOpenConversationMenu((current) => current === conversation.id ? null : conversation.id)}
                >
                  {deletingConversationId === conversation.id
                    ? <LoaderCircle size={16} className="animate-spin" />
                    : <MoreHorizontal size={17} />}
                </button>
                {openConversationMenu === conversation.id && (
                  <div className="conversation-menu">
                    <button
                      type="button"
                      className="conversation-delete-button"
                      disabled={sendingConversationId.current === conversation.id || deletingConversationId === conversation.id}
                      onClick={() => void deleteConversation(conversation)}
                    >
                      <Trash2 size={14} />
                      {sendingConversationId.current === conversation.id ? "Reply in progress" : "Delete conversation"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="sidebar-help"><CircleHelp size={16} /> Help center <span className="ml-auto text-xs text-mist">↗</span></button>
          <div className="sidebar-account">
            {user?.imageUrl ? <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="avatar-fallback">{initials}</span>}
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{user ? `${user.firstName} ${user.lastName}` : "Loading…"}</span><span className="block truncate text-xs text-mist">{user?.email}</span></span>
            <button aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-mist hover:bg-nova-soft hover:text-ink" onClick={() => void logout()}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" className="dashboard-icon-button lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
            <span className="hidden items-center gap-2 text-sm text-mist sm:flex"><Command size={15} /> Personal workspace <span>/</span> <strong className="font-medium text-ink">Chat</strong></span>
            <span className="font-display font-semibold sm:hidden">Nova AI</span>
          </div>
          <div className="flex items-center gap-3"><span className="hidden text-xs text-mist md:block">Gemini 2.5 Flash</span><ThemeToggle />{user?.imageUrl ? <img src={user.imageUrl} alt="Your profile" className="h-9 w-9 rounded-full border border-line object-cover" /> : <span className="avatar-fallback">{initials}</span>}</div>
        </header>
        <div className="chat-scroll-area">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <span className="welcome-orb"><Sparkles size={25} /></span>
              <p className="eyebrow mt-6">{loading ? "PREPARING YOUR WORKSPACE" : "YOUR THINKING, IN GOOD COMPANY"}</p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Good morning{user?.firstName ? `, ${user.firstName}` : ""}.<br /><span className="text-mist">What’s on your mind?</span></h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">{loading ? "Getting your conversations ready…" : "Start a fresh conversation or pick up an earlier idea from your history."}</p>
              <div className="mt-9 grid w-full max-w-[740px] gap-3 sm:grid-cols-3">
                {starters.map(({ icon: Icon, title, prompt }) => <button key={title} className="starter-card" onClick={() => void sendMessage(prompt)}><Icon size={17} className="text-nova" /><span className="mt-4 block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-relaxed text-mist">{prompt}</span></button>)}
              </div>
            </div>
          ) : (
            <div className="message-thread">
              {messages.map((message) => <article key={message.id} className={`chat-message ${message.role === "user" ? "chat-message-user" : ""}`}>
                {message.role === "assistant" && <span className="message-avatar"><Sparkles size={15} /></span>}
                <div className={`message-body ${message.role === "user" ? "message-body-user" : ""}`}>
                  <div className="message-meta"><strong>{message.role === "user" ? user?.firstName || "You" : "Nova"}</strong><time>{formatTime(message.createdAt)}</time></div>
                  <div className="message-content">
                    <MessageContent content={message.content} />
                  </div>
                  {message.sources?.length > 0 && <div className="chat-source-divider mt-4 pt-3"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mist">Sources</p><div className="flex flex-wrap gap-2">{message.sources.map((source, index) => <a key={`${source.url}-${index}`} className="source-link" href={source.url} target="_blank" rel="noreferrer"><span>{index + 1}</span>{source.title}</a>)}</div></div>}
                  <div className={`message-actions ${message.role === "user" ? "message-actions-user" : ""}`}>
                    <button type="button" className="copy-message-button" onClick={() => void copyMessage(message)} aria-label={copiedMessageId === message.id ? "Message copied" : "Copy message"}>
                      {copiedMessageId === message.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedMessageId === message.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                {message.role === "user" && <span className="avatar-fallback message-avatar-user">{initials}</span>}
              </article>)}
              {sending && <div className="chat-message"><span className="message-avatar"><Sparkles size={15} /></span><div className="mt-2 flex items-center gap-2 text-sm text-mist"><span className="typing-indicator"><i /><i /><i /></span>Thinking and searching the web…</div></div>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
        <div className="composer-wrap">
          <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
            <Input aria-label="Message Nova" className="h-12 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0" placeholder="Ask Nova anything…" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <button className="send-button" type="submit" disabled={!draft.trim() || sending} aria-label="Send message">{sending ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowUp size={18} />}</button>
          </form>
          <p className="mt-2 text-center text-[11px] text-mist">Nova can make mistakes. Verify important information with the linked sources.</p>
        </div>
      </section>
    </main>
  );
}
