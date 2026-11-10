"use client";

// Andor's control plane: Anton's daily plan & news, open tickets, chat, push notifications.
// Talks to Anton's API (owner only). Sign-in: Anton DMs a one-time link on Slack (#login=<token>),
// which is exchanged for a 30-day session token kept in localStorage.
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, ChevronRight, ListChecks, LogOut, MessageCircle, Sun, X } from "lucide-react";
import AntonChat, { slackToMarkdown } from "@/components/anton-chat";
import { Markdown } from "@/components/ui/markdown";

const API = process.env.NEXT_PUBLIC_ANTON_API || "https://ubuntu-dev.tail89681.ts.net";
const KEY = "anton:session";

type Item = { title: string; why: string; details: string; url: string };
type Structured = { agenda: Item[]; news: Item[]; events: Item[] };
type Summary = { text: string; period: string; created_at: string; data?: Structured | null } | null;
type Feed = { daily_briefing: Summary; weekly_briefing: Summary; digest: Summary; weekly_review: Summary };
type Ticket = { id: string; title: string; url: string; state: string; priority?: string; due?: string | null };

function ago(iso?: string) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 48 * 60) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
}

const b64ToBytes = (s: string) => {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob((s + pad).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
};

const btn =
  "rounded-md border border-paper-accent px-3 py-1.5 text-base text-paper-accent transition hover:bg-paper-accent hover:text-black disabled:opacity-50";
const quiet = "text-base text-paper-muted underline decoration-dotted underline-offset-4 hover:text-paper-accent";

export default function ControlPlane() {
  const [session, setSession] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  const api = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const r = await fetch(API + path, {
        ...init,
        headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Bearer ${session}` } : {}) },
      });
      if (r.status === 401 && session) {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        setSession(null);
      }
      const data = await r.json().catch(() => ({}));
      if (!r.ok && r.status !== 202) throw new Error(data.error || `HTTP ${r.status}`);
      return data;
    },
    [session],
  );

  useEffect(() => {
    document.title = "control plane - Andor Labs";
    const token = new URLSearchParams(location.hash.slice(1)).get("login");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    if (token) {
      history.replaceState(null, "", location.pathname);
      fetch(`${API}/api/login/finish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok && d.session) {
            try {
              localStorage.setItem(KEY, d.session);
            } catch {}
            setSession(d.session);
          } else setStatus(d.error || "That link didn't work.");
        })
        .catch(() => setStatus("Couldn't reach Anton."))
        .finally(() => setReady(true));
    } else {
      setSession(saved);
      setReady(true);
    }
  }, []);

  if (!ready) return <p className="mt-6 text-paper-muted">…</p>;
  if (!session) return <SignIn status={status} />;
  return (
    <Dashboard
      api={api}
      signOut={() => {
        void api("/api/logout", { method: "POST" }).catch(() => {});
        try {
          localStorage.removeItem(KEY);
        } catch {}
        setSession(null);
      }}
    />
  );
}

function SignIn({ status }: { status: string }) {
  const [msg, setMsg] = useState(status);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-6 max-w-md">
      <h1 className="font-hand text-5xl font-bold leading-none text-white sm:text-6xl">sign in</h1>
      <p className="mt-4 text-paper-body">Private. Anton emails a one-time sign-in link to andor@andor.us.</p>
      <button
        className={`${btn} mt-6`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await fetch(`${API}/api/login/start`, { method: "POST" });
            const d = await r.json().catch(() => ({}));
            setMsg(r.ok ? "Sent. Open the email on this device and tap the link." : d.error || "Couldn't send a link.");
          } catch {
            setMsg("Couldn't reach Anton.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "sending…" : "send me a sign-in link"}
      </button>
      <p role="status" className="mt-3 min-h-[1.5em] text-base text-paper-muted">
        {msg}
      </p>
    </div>
  );
}

type Api = (path: string, init?: RequestInit) => Promise<any>;

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-6 md:mt-12">
      <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-white/20 pb-2">
        <h2 className="font-hand text-3xl font-bold text-paper-accent">{title}</h2>
        <div className="text-base text-paper-muted">{right}</div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Tab = "today" | "chat" | "tickets" | "week";
const TABS: { id: Tab; label: string; Icon: typeof Sun }[] = [
  { id: "today", label: "today", Icon: Sun },
  { id: "chat", label: "chat", Icon: MessageCircle },
  { id: "tickets", label: "tickets", Icon: ListChecks },
  { id: "week", label: "week", Icon: CalendarDays },
];

function Dashboard({ api, signOut }: { api: Api; signOut: () => void }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [err, setErr] = useState("");
  const [running, setRunning] = useState("");
  const [tab, setTab] = useState<Tab>("today");

  const load = useCallback(async () => {
    setErr("");
    try {
      const [f, t] = await Promise.all([api("/api/feed"), api("/api/tickets")]);
      setFeed(f);
      setTickets(t.tickets);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    // Leave room under the page for the phone tab bar.
    document.documentElement.classList.add("has-tabbar");
    return () => document.documentElement.classList.remove("has-tabbar");
  }, []);

  useEffect(() => {
    void load();
    try {
      const saved = sessionStorage.getItem("anton:tab") as Tab | null;
      if (saved && TABS.some((t) => t.id === saved)) setTab(saved);
    } catch {}
  }, [load]);

  const pick = (t: Tab) => {
    setTab(t);
    try {
      sessionStorage.setItem("anton:tab", t);
    } catch {}
    window.scrollTo({ top: 0 });
  };

  const refresh = async (kind: "daily" | "weekly") => {
    setRunning(kind);
    try {
      await api("/api/briefing", { method: "POST", body: JSON.stringify({ kind }) });
      // Briefings take a minute or two (searching the news); poll for the new one.
      const before = (kind === "daily" ? feed?.daily_briefing : feed?.weekly_briefing)?.created_at;
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 6000));
        const f: Feed = await api("/api/feed");
        const now = (kind === "daily" ? f.daily_briefing : f.weekly_briefing)?.created_at;
        if (now && now !== before) {
          setFeed(f);
          break;
        }
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setRunning("");
    }
  };

  const daily = feed?.daily_briefing;
  const weekly = feed?.weekly_briefing;

  const refreshBtn = (kind: "daily" | "weekly", s: Summary) => (
    <>
      {s ? `${ago(s.created_at)} · ` : ""}
      <button className={quiet} disabled={!!running} onClick={() => refresh(kind)}>
        {running === kind ? "working…" : "refresh"}
      </button>
    </>
  );

  const today = (
    <Section title="today" right={refreshBtn("daily", daily ?? null)}>
      {daily?.data ? (
        <Briefing data={daily.data} />
      ) : daily ? (
        <Markdown className="cp-md">{slackToMarkdown(daily.text)}</Markdown>
      ) : (
        <p className="text-paper-muted">No briefing yet. Hit refresh, or wait for the morning one.</p>
      )}
    </Section>
  );
  const ticketsSection = (
    <Section title="tickets" right={tickets ? `${tickets.length} open` : ""}>
      <Tickets api={api} tickets={tickets} setTickets={setTickets} />
    </Section>
  );
  const week = (
    <>
      <Section title="week ahead" right={refreshBtn("weekly", weekly ?? null)}>
        {weekly ? <Collapsible text={weekly.text} /> : <p className="text-paper-muted">Comes every Sunday evening.</p>}
      </Section>
      {feed?.digest ? (
        <Section title="inbox digest" right={ago(feed.digest.created_at)}>
          <Collapsible text={feed.digest.text} />
        </Section>
      ) : null}
    </>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-hand text-3xl font-bold leading-none text-white sm:text-5xl">control plane</h1>
        <div className="flex items-center gap-3 text-sm">
          <PushToggle api={api} />
          <button className="p-1 text-paper-muted hover:text-paper-accent" onClick={signOut} aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      {err ? <p className="mt-3 text-base text-paper-stamp">{err}</p> : null}

      {/* Phone: one pane at a time, bottom tab bar. */}
      <div className="md:hidden">
        {tab === "today" ? today : null}
        {tab === "chat" ? (
          <div className="mt-4 h-[calc(100dvh-15rem-env(safe-area-inset-bottom))] min-h-[18rem]">
            <AntonChat api={api} fill />
          </div>
        ) : null}
        {tab === "tickets" ? ticketsSection : null}
        {tab === "week" ? week : null}
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-white/15 bg-paper-bg pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Control plane sections"
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => pick(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs ${tab === id ? "text-paper-accent" : "text-paper-muted"}`}
          >
            <Icon className="h-5 w-5" />
            {label}
            {id === "tickets" && tickets?.length ? (
              <span className="absolute right-[28%] top-1.5 rounded-full bg-paper-stamp px-1.5 text-[10px] leading-4 text-black">
                {tickets.length}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* Desktop: today + tickets on the left, chat pinned on the right. */}
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-10">
        <div>
          {today}
          {ticketsSection}
          {week}
        </div>
        <div className="sticky top-4 mt-12 h-[calc(100vh-6rem)] self-start">
          <AntonChat api={api} fill />
        </div>
      </div>
    </div>
  );
}

function Briefing({ data }: { data: Structured }) {
  const groups: [string, Item[]][] = [
    ["agenda", data.agenda],
    ["news", data.news],
    ["events", data.events],
  ];
  if (!groups.some(([, items]) => items.length)) return <p className="text-paper-muted">Nothing for today.</p>;
  return (
    <div className="space-y-5">
      {groups.map(([name, items]) =>
        items.length ? (
          <div key={name}>
            <h3 className="mb-1 text-sm uppercase tracking-widest text-paper-accent">{name}</h3>
            <ul className="divide-y divide-dashed divide-white/10">
              {items.map((it, i) => (
                <li key={i}>
                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-paper-muted transition group-open:rotate-90" />
                      <span className="min-w-0">
                        <span className="block text-base leading-snug text-white">{it.title}</span>
                        <span className="block text-sm leading-snug text-paper-muted">{it.why}</span>
                      </span>
                    </summary>
                    <div className="ml-6 mt-2 text-sm leading-relaxed text-paper-body">
                      {it.details}
                      {it.url ? (
                        <a href={it.url} target="_blank" rel="noopener noreferrer" className="ml-1 whitespace-nowrap text-paper-accent underline decoration-dotted underline-offset-2">
                          open ↗
                        </a>
                      ) : null}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </div>
  );
}

function Collapsible({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className={open ? "" : "max-h-64 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"}>
        <Markdown className="cp-md">{slackToMarkdown(text)}</Markdown>
      </div>
      <button className={`${quiet} mt-2`} onClick={() => setOpen(!open)}>
        {open ? "less" : "more"}
      </button>
    </div>
  );
}

function Tickets({ api, tickets, setTickets }: { api: Api; tickets: Ticket[] | null; setTickets: (t: Ticket[]) => void }) {
  const [busy, setBusy] = useState("");
  if (!tickets) return <p className="text-paper-muted">loading…</p>;
  if (!tickets.length) return <p className="text-paper-muted">Nothing open. Nice.</p>;
  const act = async (t: Ticket, state: "done" | "canceled") => {
    setBusy(t.id);
    try {
      await api(`/api/tickets/${t.id}/state`, { method: "POST", body: JSON.stringify({ state }) });
      setTickets(tickets.filter((x) => x.id !== t.id));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <ul className="divide-y divide-dashed divide-white/10">
      {tickets.map((t) => (
        <li key={t.id} className={`flex items-center gap-2 py-2.5 ${busy === t.id ? "opacity-40" : ""}`}>
          <div className="min-w-0 flex-1">
            <div className="text-base leading-snug text-paper-body sm:text-lg">{t.title}</div>
            <div className="mt-0.5 flex gap-2 text-xs text-paper-muted">
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-paper-accent">
                {t.id}
              </a>
              {t.priority && t.priority !== "No priority" ? <span>{t.priority.toLowerCase()}</span> : null}
              {t.due ? <span className="text-paper-stamp">due {t.due}</span> : null}
            </div>
          </div>
          <button
            className="rounded-md p-2.5 text-paper-muted hover:bg-white/5 hover:text-paper-accent"
            disabled={busy === t.id}
            onClick={() => act(t, "done")}
            aria-label={`Mark ${t.id} done`}
            title="Done"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            className="rounded-md p-2.5 text-paper-muted hover:bg-white/5 hover:text-paper-stamp"
            disabled={busy === t.id}
            onClick={() => act(t, "canceled")}
            aria-label={`Drop ${t.id}`}
            title="Drop"
          >
            <X className="h-5 w-5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function PushToggle({ api }: { api: Api }) {
  const [state, setState] = useState<"unsupported" | "off" | "on" | "busy" | "blocked">("off");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") setState("blocked");
    navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription()).then((s) => s && setState("on"));
  }, []);

  if (state === "unsupported")
    return <span className="text-base text-paper-muted" title="On iPhone, add andor.us to the Home Screen first">no push here</span>;
  if (state === "blocked") return <span className="text-base text-paper-muted">notifications blocked</span>;

  const enable = async () => {
    setState("busy");
    try {
      if ((await Notification.requestPermission()) !== "granted") return setState("blocked");
      const reg = await navigator.serviceWorker.ready;
      const { key } = await api("/api/push/key");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
      await api("/api/push/subscribe", { method: "POST", body: JSON.stringify({ subscription: sub.toJSON() }) });
      await api("/api/push/test", { method: "POST" });
      setState("on");
    } catch (e) {
      alert(`Couldn't turn on notifications: ${(e as Error).message}`);
      setState("off");
    }
  };
  const disable = async () => {
    setState("busy");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await api("/api/push/unsubscribe", { method: "POST", body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
      await sub.unsubscribe();
    }
    setState("off");
  };

  return (
    <button className={quiet} disabled={state === "busy"} onClick={state === "on" ? disable : enable}>
      {state === "on" ? "notifications on" : state === "busy" ? "…" : "turn on notifications"}
    </button>
  );
}
