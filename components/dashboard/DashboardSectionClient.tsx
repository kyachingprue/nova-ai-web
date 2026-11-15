"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  BarChart3, FileText, LayoutDashboard, LoaderCircle, LogOut, Menu, MessageSquare,
  Search, Settings as SettingsIcon, ShieldCheck, UserRound, Users, X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandMark from "@/components/BrandMark";
import type { AdminSettings } from "@/lib/admin-settings";
import type { CurrentUser, UserRole } from "@/lib/user-role";

type Section = "overview" | "users" | "analytics" | "profile" | "reports" | "settings";
type Profile = Omit<CurrentUser, "id">;
type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  role: UserRole;
  plan: string;
  subscriptionStatus?: string;
  createdAt: string;
};
type Overview = {
  stats: Record<string, number>;
  recentUsers: AdminUser[];
};
type AnalyticsPoint = { date: string; users: number; conversations: number; messages: number };
type UsersResult = { users: AdminUser[]; page: number; pages: number; total: number };
type TopicReport = { topic: string; conversations: number };

const adminNavigation: Array<{ id: Section | "chat"; label: string; href: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { id: "chat", label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { id: "users", label: "All users", href: "/dashboard/users", icon: Users },
  { id: "analytics", label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { id: "reports", label: "Reports", href: "/dashboard/reports", icon: FileText },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

const userNavigation = [
  { id: "chat", label: "Chat", href: "/dashboard", icon: MessageSquare },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: UserRound },
];

const titles: Record<Section, string> = {
  overview: "Overview",
  users: "All users",
  analytics: "Analytics",
  profile: "Profile",
  reports: "Topic reports",
  settings: "Settings",
};

function displayDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line-strong bg-bg-elevated p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-ink">{label}</p>
      {payload.map((item) => (
        <p key={`${item.name || "metric"}-${item.value}`} style={{ color: item.color }} className="mt-1">
          {item.name}: {item.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article className="rounded-2xl border border-line bg-bg-card p-5 sm:p-6">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs text-mist">{note}</p>
    </article>
  );
}

function UserAvatar({ user, size = 36 }: { user: Pick<AdminUser, "imageUrl">; size?: number }) {
  return (
    <img
      src={user.imageUrl || "/default-avatar.svg"}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-line-strong object-cover"
      style={{ width: size, height: size }}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = "/default-avatar.svg";
      }}
    />
  );
}

export default function DashboardSectionClient({
  role,
  section,
  initialUser,
}: {
  role: UserRole;
  section: Section;
  initialUser: CurrentUser;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [account, setAccount] = useState(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialUser);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([]);
  const [usersData, setUsersData] = useState<UsersResult | null>(null);
  const [topics, setTopics] = useState<TopicReport[]>([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [settingsDraft, setSettingsDraft] = useState<AdminSettings | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ firstName: "", lastName: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (section === "overview") {
          const [overviewResponse, analyticsResponse] = await Promise.all([
            fetch("/api/admin/overview"),
            fetch("/api/admin/analytics"),
          ]);
          const [overviewResult, analyticsResult] = await Promise.all([
            overviewResponse.json(),
            analyticsResponse.json(),
          ]);
          if (!overviewResponse.ok) throw new Error(overviewResult.error || "Unable to load overview.");
          if (!analyticsResponse.ok) throw new Error(analyticsResult.error || "Unable to load overview chart.");
          if (active) {
            setOverview(overviewResult);
            setAnalytics(analyticsResult.days);
          }
        } else if (section === "users") {
          const params = new URLSearchParams({ page: String(page), q: search });
          const response = await fetch(`/api/admin/users?${params}`);
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to load users.");
          if (active) setUsersData(result);
        } else if (section === "analytics") {
          const response = await fetch("/api/admin/analytics");
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to load analytics.");
          if (active) setAnalytics(result.days);
        } else if (section === "reports") {
          const response = await fetch("/api/admin/reports");
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to load reports.");
          if (active) {
            setTopics(result.topics);
            setTotalConversations(result.totalConversations);
          }
        } else if (section === "settings") {
          const response = await fetch("/api/admin/settings");
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to load settings.");
          if (active) {
            setSettingsDraft(result.settings);
          }
        } else {
          const response = await fetch("/api/profile");
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to load your profile.");
          if (active) {
            setProfile(result.profile);
            setAccount((current) => ({ ...current, ...result.profile }));
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load this page.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [page, search, section]);

  function openProfileEditor() {
    if (!profile) return;
    setProfileDraft({ firstName: profile.firstName, lastName: profile.lastName });
    setProfileModalOpen(true);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileDraft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save your profile.");
      setProfile(result.profile);
      setAccount((current) => ({ ...current, ...result.profile }));
      setProfileModalOpen(false);
      toast.success("Profile updated.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadProfileImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a PNG, JPG, or WEBP image smaller than 5 MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/profile/image", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setProfile((current) => current ? { ...current, imageUrl: result.imageUrl } : current);
      setAccount((current) => ({ ...current, imageUrl: result.imageUrl }));
      toast.success("Profile image updated.");
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settingsDraft) return;
    setSavingSettings(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsDraft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save settings.");
      setSettingsDraft(result.settings);
      toast.success("Settings saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("You’ve been signed out.");
    router.replace("/");
    router.refresh();
  }

  const navigation = role === "admin" ? adminNavigation : userNavigation;

  return (
    <main className="dashboard-shell">
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" className="auth-brand"><BrandMark />Nova AI</Link>
          <button className="mobile-sidebar-close" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <div className="sidebar-section-label">{role === "admin" ? "ADMIN WORKSPACE" : "YOUR WORKSPACE"}</div>
        <nav className="flex flex-col gap-1">
          {navigation.map(({ id, label, href, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`workspace-item dashboard-nav-link ${id === section ? "dashboard-nav-active" : ""}`}
            >
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <Link href="/dashboard/profile" onClick={() => setSidebarOpen(false)} className="sidebar-account">
            <UserAvatar user={account} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{account.firstName} {account.lastName}</span>
              <span className="block truncate text-xs text-mist">{role === "admin" ? "Administrator" : account.email}</span>
            </span>
          </Link>
          <button aria-label="Sign out" title="Sign out" className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-mist hover:bg-nova-soft hover:text-ink" onClick={() => void logout()}>
            <LogOut size={15} />Sign out
          </button>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" className="dashboard-icon-button lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
            <span className="font-display font-semibold text-ink">{titles[section]}</span>
          </div>
          <div className="flex items-center gap-3">
            {role === "admin" && <span className="hidden text-xs text-mist md:block">Administrator</span>}
            <ThemeToggle />
            <UserAvatar user={account} />
          </div>
        </header>
        <div className="chat-scroll-area">
          <div className="w-full max-w-[1180px] self-center p-4 sm:p-7 lg:p-9">
            {loading && <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-mist"><LoaderCircle size={18} className="animate-spin" />Loading dashboard…</div>}
            {!loading && error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
            {!loading && !error && section === "overview" && overview && (
              <OverviewView overview={overview} analytics={analytics} />
            )}
            {!loading && !error && section === "analytics" && <AnalyticsView analytics={analytics} />}
            {!loading && !error && section === "users" && usersData && (
              <UsersView
                result={usersData}
                searchInput={searchInput}
                onSearchInput={setSearchInput}
                onSearch={(event) => {
                  event.preventDefault();
                  setPage(1);
                  setSearch(searchInput.trim());
                }}
                onPage={setPage}
              />
            )}
            {!loading && !error && section === "reports" && (
              <ReportsView topics={topics} totalConversations={totalConversations} />
            )}
            {!loading && !error && section === "profile" && profile && (
              <ProfileView
                profile={profile}
                onEdit={openProfileEditor}
                onUpload={(file) => void uploadProfileImage(file)}
                uploading={uploadingImage}
              />
            )}
            {!loading && !error && section === "settings" && settingsDraft && (
              <SettingsView settings={settingsDraft} onChange={setSettingsDraft} onSave={saveSettings} saving={savingSettings} />
            )}
          </div>
        </div>
      </section>

      {profileModalOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setProfileModalOpen(false);
        }}>
          <section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">PROFILE DETAILS</p>
                <h2 id="profile-edit-title" className="mt-2 font-display text-2xl font-semibold">Edit your profile</h2>
              </div>
              <button type="button" className="rounded-lg p-2 text-mist hover:bg-nova-soft" aria-label="Close edit profile" onClick={() => setProfileModalOpen(false)}><X size={18} /></button>
            </div>
            <form className="space-y-4" onSubmit={(event) => void saveProfile(event)}>
              <label className="field-label">First name<Input autoComplete="given-name" value={profileDraft.firstName} onChange={(event) => setProfileDraft((current) => ({ ...current, firstName: event.target.value }))} required maxLength={80} /></label>
              <label className="field-label">Last name<Input autoComplete="family-name" value={profileDraft.lastName} onChange={(event) => setProfileDraft((current) => ({ ...current, lastName: event.target.value }))} required maxLength={80} /></label>
              <label className="field-label">Email address<Input value={profile?.email || ""} readOnly aria-describedby="profile-email-note" /></label>
              <p id="profile-email-note" className="-mt-2 text-xs text-mist">Email and role changes are managed securely and can’t be edited here.</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setProfileModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={savingProfile}>{savingProfile ? <LoaderCircle size={16} className="animate-spin" /> : null}Save changes</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function OverviewView({ overview, analytics }: { overview: Overview; analytics: AnalyticsPoint[] }) {
  const stats = overview.stats;
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">LIVE PLATFORM SUMMARY</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Welcome to your overview</h1>
        <p className="mt-2 text-sm text-mist">Current account, conversation, and activity totals.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total users" value={stats.totalUsers || 0} note={`${stats.adminUsers || 0} administrators`} />
        <StatCard label="Conversations" value={stats.totalConversations || 0} note="Across all accounts" />
        <StatCard label="User messages" value={stats.totalMessages || 0} note={`${stats.messagesToday || 0} today`} />
        <StatCard label="Active users" value={stats.activeUsers30Days || 0} note="With activity in the last 30 days" />
        <StatCard label="New this month" value={stats.newUsersThisMonth || 0} note="New accounts this month" />
      </div>
      <section className="rounded-2xl border border-line bg-bg-card p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-display text-lg font-semibold">Activity · last 30 days</h2>
          <p className="mt-1 text-xs text-mist">New accounts and chat activity by day.</p>
        </div>
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="var(--line-strong)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} stroke="var(--mist)" fontSize={11} />
              <YAxis allowDecimals={false} stroke="var(--mist)" fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="users" name="New users" stroke="var(--nova-violet)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="messages" name="Messages" stroke="#35c78a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-line bg-bg-card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div><h2 className="font-display font-semibold">Recently joined</h2><p className="mt-1 text-xs text-mist">Latest accounts created</p></div>
          <Link href="/dashboard/users" className="text-xs font-semibold text-nova hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-line">
          {overview.recentUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-5 py-3">
              <UserAvatar user={user} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="truncate text-xs text-mist">{user.email}</p>
              </div>
              <span className="hidden rounded-full bg-nova-soft px-2.5 py-1 text-[10px] capitalize text-nova sm:inline-flex">{user.role}</span>
              <time className="hidden text-xs text-mist md:block">{displayDate(user.createdAt)}</time>
            </div>
          ))}
          {overview.recentUsers.length === 0 && <p className="px-5 py-8 text-center text-sm text-mist">No user accounts yet.</p>}
        </div>
      </section>
    </div>
  );
}

function AnalyticsView({ analytics }: { analytics: AnalyticsPoint[] }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">PLATFORM ACTIVITY</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-mist">Daily account growth, conversations, and user messages over the last 30 days.</p>
      </div>
      <section className="rounded-2xl border border-line bg-bg-card p-4 sm:p-6">
        <div className="h-[320px] w-full sm:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics} margin={{ top: 12, right: 12, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="var(--line-strong)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} stroke="var(--mist)" fontSize={11} />
              <YAxis allowDecimals={false} stroke="var(--mist)" fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="users" name="New users" stroke="var(--nova-violet)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="conversations" name="Conversations" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="messages" name="User messages" stroke="#35c78a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="New users" value={analytics.reduce((total, point) => total + point.users, 0)} note="Last 30 days" />
        <StatCard label="Conversations" value={analytics.reduce((total, point) => total + point.conversations, 0)} note="Last 30 days" />
        <StatCard label="User messages" value={analytics.reduce((total, point) => total + point.messages, 0)} note="Last 30 days" />
      </div>
    </div>
  );
}

function UsersView({
  result,
  searchInput,
  onSearchInput,
  onSearch,
  onPage,
}: {
  result: UsersResult;
  searchInput: string;
  onSearchInput: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onPage: (page: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">ACCOUNT DIRECTORY</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">All users</h1>
          <p className="mt-2 text-sm text-mist">{result.total.toLocaleString()} accounts</p>
        </div>
        <form className="flex w-full gap-2 sm:max-w-sm" onSubmit={onSearch}>
          <Input value={searchInput} onChange={(event) => onSearchInput(event.target.value)} placeholder="Search name or email" aria-label="Search users" />
          <Button type="submit" size="icon" aria-label="Search"><Search size={17} /></Button>
        </form>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-bg-card">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-line bg-bg-elevated text-xs uppercase tracking-wide text-mist">
              <tr><th className="px-5 py-4 font-medium">User</th><th className="px-4 py-4 font-medium">Role</th><th className="px-4 py-4 font-medium">Plan</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.users.map((user) => <tr key={user.id} className="hover:bg-nova-soft/40">
                <td className="px-5 py-3"><div className="flex items-center gap-3"><UserAvatar user={user} size={36} /><div className="min-w-0"><p className="font-medium">{user.firstName} {user.lastName}</p><p className="max-w-[280px] truncate text-xs text-mist">{user.email}</p></div></div></td>
                <td className="px-4 py-3"><span className="rounded-full bg-nova-soft px-2.5 py-1 text-xs capitalize text-nova">{user.role}</span></td>
                <td className="px-4 py-3 capitalize text-ink-soft">{user.plan}</td>
                <td className="px-4 py-3 capitalize text-mist">{user.subscriptionStatus || "inactive"}</td>
                <td className="px-4 py-3 text-xs text-mist">{displayDate(user.createdAt)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-line md:hidden">
          {result.users.map((user) => <article key={user.id} className="flex items-center gap-3 p-4">
            <UserAvatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-mist">{user.email}</p>
              <p className="mt-1 text-[11px] capitalize text-mist">{user.role} · {user.plan} · {displayDate(user.createdAt)}</p>
            </div>
          </article>)}
        </div>
        {result.users.length === 0 && <p className="px-5 py-10 text-center text-sm text-mist">No users match that search.</p>}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-mist">
        <span>Page {result.page} of {result.pages}</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={result.page <= 1} onClick={() => onPage(result.page - 1)}>Previous</Button>
          <Button variant="secondary" size="sm" disabled={result.page >= result.pages} onClick={() => onPage(result.page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ topics, totalConversations }: { topics: TopicReport[]; totalConversations: number }) {
  const data = topics.slice(0, 10);
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">AGGREGATED CONVERSATION TRENDS</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Topic reports</h1>
        <p className="mt-2 text-sm text-mist">Topics are estimated from conversation titles. Individual message content is not shown.</p>
      </div>
      <StatCard label="Conversations analyzed" value={totalConversations} note="Across all accounts" />
      <section className="rounded-2xl border border-line bg-bg-card p-4 sm:p-6">
        <h2 className="mb-5 font-display text-lg font-semibold">Most discussed topics</h2>
        {data.length ? (
          <div className="h-[330px] w-full sm:h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 15, bottom: 4, left: 12 }}>
                <CartesianGrid stroke="var(--line-strong)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="var(--mist)" fontSize={11} />
                <YAxis type="category" dataKey="topic" width={142} stroke="var(--mist)" fontSize={10} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="conversations" name="Conversations" fill="var(--nova-violet)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-12 text-center text-sm text-mist">No conversations to report yet.</p>}
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((item, index) => <article key={item.topic} className="flex items-center gap-3 rounded-xl border border-line bg-bg-card p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-nova-soft text-sm font-semibold text-nova">{index + 1}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.topic}</span>
          <span className="text-xs text-mist">{item.conversations.toLocaleString()} chats</span>
        </article>)}
      </div>
    </div>
  );
}

function ProfileView({
  profile,
  onEdit,
  onUpload,
  uploading,
}: {
  profile: Profile;
  onEdit: () => void;
  onUpload: (file?: File) => void;
  uploading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow">ACCOUNT</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Your profile</h1><p className="mt-2 text-sm text-mist">Manage your personal information and profile picture.</p></div>
        <Button onClick={onEdit}>Edit profile</Button>
      </div>
      <section className="rounded-2xl border border-line bg-bg-card p-5 sm:p-8">
        <div className="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <UserAvatar user={profile} size={96} />
            <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-bg-card bg-nova text-white shadow-lg" title="Change profile image">
              {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <UserRound size={16} />}
              <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => {
                onUpload(event.target.files?.[0]);
                event.currentTarget.value = "";
              }} />
            </label>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{profile.firstName} {profile.lastName}</h2>
            <p className="mt-1 text-sm text-mist">{profile.email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-nova-soft px-3 py-1 text-xs capitalize text-nova"><ShieldCheck size={13} />{profile.role}</span>
          </div>
        </div>
        <dl className="grid gap-x-8 gap-y-6 pt-7 sm:grid-cols-2">
          <ProfileField label="First name" value={profile.firstName} />
          <ProfileField label="Last name" value={profile.lastName} />
          <ProfileField label="Email address" value={profile.email} />
          <ProfileField label="Role" value={profile.role} capitalize />
          <ProfileField label="Plan" value={profile.plan} capitalize />
          <ProfileField label="Member since" value={displayDate(profile.createdAt)} />
        </dl>
        <p className="mt-7 border-t border-line pt-5 text-xs text-mist">Profile details are visible only to you and authorized administrators. Role and email changes are not available in profile editing.</p>
      </section>
    </div>
  );
}

function ProfileField({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return <div><dt className="text-xs text-mist">{label}</dt><dd className={`mt-1.5 text-sm font-medium text-ink ${capitalize ? "capitalize" : ""}`}>{value}</dd></div>;
}

function SettingsView({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: AdminSettings;
  onChange: (value: AdminSettings) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">ADMIN CONTROLS</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-mist">These controls apply across the chat service. API keys remain server-side environment variables.</p>
      </div>
      <form className="max-w-3xl space-y-5 rounded-2xl border border-line bg-bg-card p-5 sm:p-7" onSubmit={onSave}>
        <label className="field-label">Default OpenRouter model
          <Input value={settings.defaultModel} onChange={(event) => onChange({ ...settings, defaultModel: event.target.value })} maxLength={160} required />
          <span className="text-xs font-normal text-mist">Use <code>openrouter/free</code> for free-model routing. Other model IDs may be paid.</span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-line p-4">
          <input className="mt-1 h-4 w-4 accent-nova" type="checkbox" checked={settings.webSearchEnabled} onChange={(event) => onChange({ ...settings, webSearchEnabled: event.target.checked })} />
          <span><span className="block text-sm font-medium">Enable web search</span><span className="mt-1 block text-xs text-mist">OpenRouter web search may incur additional charges, even when using free models.</span></span>
        </label>
        <label className="field-label">Free-plan messages per month
          <Input type="number" min={1} max={100000} value={settings.freeMonthlyMessageLimit} onChange={(event) => onChange({ ...settings, freeMonthlyMessageLimit: Number(event.target.value) })} required />
          <span className="text-xs font-normal text-mist">Applies to regular users on the Free plan. Administrators are not limited.</span>
        </label>
        <div className="flex justify-end border-t border-line pt-5">
          <Button type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="animate-spin" /> : null}Save settings</Button>
        </div>
      </form>
    </div>
  );
}

function shortDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
