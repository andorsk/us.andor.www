"use client";

// Andor's dashboard at /me: Anton's daily plan & news, open tickets, chat, push notifications.
// Talks to Anton's API (owner only). Sign-in: Anton DMs a one-time link on Slack (#login=<token>),
// which is exchanged for a 30-day session token kept in localStorage.
import { useCallback, useEffect, useState } from "react";
import { Bell, CalendarDays, Check, ChevronRight, ListChecks, LogOut, Mail, MessageCircle, Sun, Terminal, X } from "lucide-react";
import WorkPanel from "@/components/work-panel";
import InboxPanel from "@/components/inbox-panel";
import AntonChat, { slackToMarkdown } from "@/components/anton-chat";
import { Markdown } from "@/components/ui/markdown";

const API = process.env.NEXT_PUBLIC_ANTON_API || "https://ubuntu-dev.tail89681.ts.net";
const KEY = "anton:session";

type Item = { title: string; why: string; details: string; url: string };
type Structured = { agenda: Item[]; news: Item[]; events: Item[] };
type DigestEmail = {
  priority: string; category: string; subject: string; from: string; summary: string; link: string;
  draft: boolean; acked: boolean; tickets: { id: string; url: string }[];
};
type DigestData = {
  scanned: number; emails: DigestEmail[];
  invites: { title: string; when: string; from: string; link: string }[];
  money: { kind: string; vendor: string; amount: number | null; currency: string | null; due: string | null; link: string }[];
  waiting: { to: string; subject: string; since: string }[];
};
type Summary = { text: string; period: string; created_at: string; data?: any } | null;
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
    document.title = "Anton, son of Andor";
    void navigator.storage?.persist?.().catch(() => {});
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
  if (!session)
    return (
      <SignIn
        status={status}
        onSession={(sess) => {
          try {
            localStorage.setItem(KEY, sess);
          } catch {}
          setSession(sess);
        }}
      />
    );
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

function SignIn({ status, onSession }: { status: string; onSession: (s: string) => void }) {
  const [msg, setMsg] = useState(status);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  const send = async () => {
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/login/start`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (r.ok || r.status === 429) setSent(true);
      setMsg(r.ok ? "Code sent to andor@andor.us." : d.error || "Couldn't send a code.");
    } catch {
      setMsg("Couldn't reach Anton.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/login/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.session) onSession(d.session);
      else setMsg(d.error || "That code didn't work.");
    } catch {
      setMsg("Couldn't reach Anton.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 max-w-md">
      <h1 className="font-hand text-5xl font-bold leading-none text-white sm:text-6xl">sign in</h1>
      <p className="mt-4 text-paper-body">Private. Anton emails a 6-digit code to andor@andor.us.</p>
      {sent ? (
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void verify(code);
          }}
        >
          <input
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(v);
              if (v.length === 6) void verify(v);
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            aria-label="Sign-in code"
            autoFocus
            className="w-40 rounded-md border border-dashed border-white/30 bg-transparent px-3 py-2 text-center font-mono text-xl tracking-[0.3em] text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none"
          />
          <button type="submit" className={btn} disabled={busy || code.length !== 6}>
            {busy ? "…" : "sign in"}
          </button>
        </form>
      ) : (
        <button className={`${btn} mt-6`} disabled={busy} onClick={send}>
          {busy ? "sending…" : "email me a code"}
        </button>
      )}
      <p role="status" className="mt-3 min-h-[1.5em] text-base text-paper-muted">
        {msg}
        {sent ? (
          <button className={`${quiet} ml-3`} disabled={busy} onClick={send}>
            resend
          </button>
        ) : null}
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

type Tab = "today" | "chat" | "inbox" | "tickets" | "work" | "week";
const TABS: { id: Tab; label: string; Icon: typeof Sun }[] = [
  { id: "today", label: "today", Icon: Sun },
  { id: "chat", label: "chat", Icon: MessageCircle },
  { id: "inbox", label: "inbox", Icon: Mail },
  { id: "tickets", label: "tickets", Icon: ListChecks },
  { id: "work", label: "work", Icon: Terminal },
  { id: "week", label: "week", Icon: CalendarDays },
];

function Dashboard({ api, signOut }: { api: Api; signOut: () => void }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [err, setErr] = useState("");
  const [running, setRunning] = useState("");
  const [tab, setTab] = useState<Tab>("today");
  const [notes, setNotes] = useState(false);
  const [unread, setUnread] = useState(0);
  const markRead = useCallback(() => setUnread(0), []);
  useEffect(() => {
    api("/api/notifications").then((d) => setUnread(d.unread)).catch(() => {});
  }, [api]);

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
    setNotes(false);
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

  const runDigest = async () => {
    setRunning("digest");
    try {
      const before = feed?.digest?.created_at;
      await api("/api/digest", { method: "POST" });
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const f: Feed = await api("/api/feed");
        if (f.digest?.created_at && f.digest.created_at !== before) {
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
        <Briefing data={daily.data as Structured} />
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
    <Section title="week ahead" right={refreshBtn("weekly", weekly ?? null)}>
      {weekly ? <Collapsible text={weekly.text} /> : <p className="text-paper-muted">Comes every Sunday evening.</p>}
    </Section>
  );
  const inbox = (
    <Section title="inbox">
      <InboxPanel api={api} />
      {feed?.digest?.data && ((feed.digest.data as DigestData).invites.length || (feed.digest.data as DigestData).money.length) ? (
        <details className="mt-6">
          <summary className="cursor-pointer select-none text-sm uppercase tracking-widest text-paper-muted">
            invites &amp; money · {ago(feed.digest.created_at)}{" "}
            <button className="ml-2 normal-case tracking-normal underline decoration-dotted underline-offset-4" disabled={!!running}
              onClick={(e) => { e.preventDefault(); void runDigest(); }}>
              {running === "digest" ? "working…" : "refresh"}
            </button>
          </summary>
          <div className="mt-3">
            <Inbox data={{ ...(feed.digest.data as DigestData), emails: [], waiting: [] }} extrasOnly />
          </div>
        </details>
      ) : null}
    </Section>
  );

  return (
    <div>
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-3 text-sm">
          <PushToggle api={api} />
          <button className="relative p-1 text-paper-muted hover:text-paper-accent" onClick={() => setNotes(!notes)}
            aria-label="Notifications" title="Notifications" aria-expanded={notes}>
            <Bell className={`h-5 w-5 ${notes ? "text-paper-accent" : ""}`} />
            {unread ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-paper-stamp px-1 text-[10px] leading-4 text-black">{unread}</span>
            ) : null}
          </button>
          <button className="p-1 text-paper-muted hover:text-paper-accent" onClick={signOut} aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      {err ? <p className="mt-3 text-base text-paper-stamp">{err}</p> : null}
      {notes ? <Notifications api={api} onClose={() => setNotes(false)} onRead={markRead} /> : null}

      {/* Phone: one pane at a time, bottom tab bar. */}
      <div className={notes ? "hidden" : "md:hidden"}>
        {tab === "today" ? today : null}
        {tab === "chat" ? (
          <div className="mt-4 h-[calc(100dvh-15rem-env(safe-area-inset-bottom))] min-h-[18rem]">
            <AntonChat api={api} fill />
          </div>
        ) : null}
        {tab === "tickets" ? ticketsSection : null}
        {tab === "inbox" ? inbox : null}
        {tab === "work" ? (
          <div className="mt-4 h-[calc(100dvh-15rem-env(safe-area-inset-bottom))] min-h-[18rem]">
            <WorkPanel api={api} fill />
          </div>
        ) : null}
        {tab === "week" ? week : null}
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-white/15 bg-paper-bg pb-[env(safe-area-inset-bottom)] md:hidden"
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
      <div className={notes ? "hidden" : "hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-10"}>
        <div>
          {today}
          {ticketsSection}
          <Section title="work">
            <WorkPanel api={api} />
          </Section>
          {inbox}
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

const DOT: Record<string, string> = { urgent: "bg-paper-stamp", high: "bg-paper-accent", normal: "bg-sky-400/70", low: "bg-white/25" };

function when(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return iso.length <= 10
    ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
    : d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Group({ name, count, children }: { name: string; count?: number; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-sm uppercase tracking-widest text-paper-accent">
        {name}
        {count ? <span className="ml-2 text-paper-muted">{count}</span> : null}
      </h3>
      <ul className="divide-y divide-dashed divide-white/10">{children}</ul>
    </div>
  );
}

const pill = "rounded border border-white/20 px-1.5 text-[11px] leading-4 text-paper-muted";
const action = "rounded-md border border-white/20 px-2.5 py-1 text-sm text-paper-body hover:border-paper-accent hover:text-paper-accent";

function Inbox({ data, extrasOnly = false }: { data: DigestData; extrasOnly?: boolean }) {
  const order: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
  const emails = [...data.emails].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
  return (
    <div className="space-y-5">
      {extrasOnly ? null : (
        <p className="text-sm text-paper-muted">
          {emails.length} need you · {data.scanned} triaged
        </p>
      )}
      {extrasOnly ? null : emails.length ? (
        <Group name="needs you" count={emails.length}>
          {emails.map((e, i) => (
            <li key={i}>
              <details className="group py-2">
                <summary className="flex cursor-pointer list-none items-start gap-2.5 [&::-webkit-details-marker]:hidden">
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${DOT[e.priority] ?? DOT.low}`} title={e.priority} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base leading-snug text-white">{e.subject || "(no subject)"}</span>
                    <span className="flex items-center gap-1.5 text-sm text-paper-muted">
                      <span className="truncate">{e.from}</span>
                      {e.category === "linkedin_outreach" ? <span className={pill}>linkedin</span> : null}
                      {e.draft ? <span className={pill}>draft</span> : null}
                      {e.acked ? <span className={pill}>acked</span> : null}
                    </span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-paper-muted transition group-open:rotate-90" />
                </summary>
                <div className="ml-[18px] mt-2 space-y-2">
                  <p className="text-sm leading-relaxed text-paper-body">{e.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    <a className={action} href={e.link} target="_blank" rel="noopener noreferrer">open in gmail</a>
                    {e.draft ? (
                      <a className={action} href="https://mail.google.com/mail/u/0/#drafts" target="_blank" rel="noopener noreferrer">review draft</a>
                    ) : null}
                    {e.tickets.map((t) => (
                      <a key={t.id} className={action} href={t.url} target="_blank" rel="noopener noreferrer">{t.id}</a>
                    ))}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </Group>
      ) : (
        <p className="text-paper-muted">Inbox zero on things that need you.</p>
      )}
      {data.invites.length ? (
        <Group name="invites to answer" count={data.invites.length}>
          {data.invites.map((v, i) => (
            <li key={i} className="py-2">
              <a href={v.link || undefined} target="_blank" rel="noopener noreferrer" className="block">
                <span className="block truncate text-base text-white">{v.title}</span>
                <span className="block truncate text-sm text-paper-muted">{when(v.when)} · {v.from}</span>
              </a>
            </li>
          ))}
        </Group>
      ) : null}
      {data.money.length ? (
        <Group name="money" count={data.money.length}>
          {data.money.map((m, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 py-2">
              <a href={m.link} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-base text-white">
                {m.vendor || m.kind}
              </a>
              <span className="shrink-0 text-sm text-paper-muted">
                {m.amount != null ? `${m.currency || "$"} ${m.amount.toLocaleString()}` : m.kind}
                {m.due ? <span className="ml-2 text-paper-stamp">due {when(m.due)}</span> : null}
              </span>
            </li>
          ))}
        </Group>
      ) : null}
      {data.waiting.length ? (
        <Group name="waiting on" count={data.waiting.length}>
          {data.waiting.map((w, i) => (
            <li key={i} className="py-2">
              <span className="block truncate text-base text-white">{w.to}</span>
              <span className="block truncate text-sm text-paper-muted">{w.subject} · since {when(w.since)}</span>
            </li>
          ))}
        </Group>
      ) : null}
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

const EMOJI: Record<string, string> = {
  hourglass: "⏳", hourglass_flowing_sand: "⏳", calendar: "📅", spiral_calendar_pad: "🗓️", inbox_tray: "📥", email: "✉️",
  white_check_mark: "✅", warning: "⚠️", bell: "🔔", money_with_wings: "💸", moneybag: "💰", sunrise: "🌅", wave: "👋",
};
const emojify = (s: string) => s.replace(/:([a-z0-9_+-]+):/g, (m, k) => EMOJI[k] ?? "");

type Note = { id: number; title: string; body: string; full: string; tag: string; delivered: number; created_at: string; read_at: string | null };

function Notifications({ api, onClose, onRead }: { api: Api; onClose: () => void; onRead: () => void }) {
  const [rows, setRows] = useState<Note[] | null>(null);
  useEffect(() => {
    api("/api/notifications")
      .then((d) => {
        setRows(d.notifications);
        if (d.unread) api("/api/notifications/read", { method: "POST" }).then(onRead).catch(() => {});
      })
      .catch(() => setRows([]));
  }, [api, onRead]);
  return (
    <Section title="notifications" right={<button className={quiet} onClick={onClose}>close</button>}>
      {!rows ? (
        <p className="text-paper-muted">loading…</p>
      ) : !rows.length ? (
        <p className="text-paper-muted">Nothing yet. Every push Anton sends shows up here.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li key={n.id}>
              <details className="group rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-2.5">
                <summary className="flex cursor-pointer list-none items-start gap-2.5 [&::-webkit-details-marker]:hidden">
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-white/20" : "bg-paper-accent"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-base text-white">{n.title}</span>
                      <span className="shrink-0 text-xs text-paper-muted">{ago(n.created_at)}</span>
                    </span>
                    <span className="block truncate text-sm text-paper-muted group-open:hidden">{emojify(n.body).replace(/[*_]/g, "")}</span>
                  </span>
                </summary>
                <div className="ml-[18px] mt-2">
                  <Markdown className="cp-md">{slackToMarkdown(emojify(n.full || n.body))}</Markdown>
                  <p className="mt-2 text-xs text-paper-muted">
                    {n.tag} · {new Date(n.created_at).toLocaleString()} · {n.delivered ? `delivered to ${n.delivered} device${n.delivered > 1 ? "s" : ""}` : "not delivered (no device subscribed)"}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
