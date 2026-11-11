"use client";

// Andor's dashboard at /me: Anton's daily plan & news, open tickets, chat, push notifications.
// Talks to Anton's API (owner only). Sign-in: Anton DMs a one-time link on Slack (#login=<token>),
// which is exchanged for a 30-day session token kept on the device (see tokenStore).
import { useCallback, useEffect, useState } from "react";
import {
  Bell, Bot, CalendarDays, Check, ChevronRight, LayoutGrid, QrCode, ListChecks, LogOut, Mail, MessageCircle, Sun, Terminal, Users, X,
} from "lucide-react";
import WorkPanel from "@/components/work-panel";
import InboxPanel from "@/components/inbox-panel";
import ConnectionsPanel from "@/components/connections-panel";
import { QRCodeSVG } from "qrcode.react";
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

// The session token is kept in three places (localStorage, IndexedDB and a first-party cookie) so that
// losing one (storage eviction, a browser clearing one store) doesn't sign the phone out.
const IDB = "anton";
function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T | undefined> {
  return new Promise((resolve) => {
    try {
      const open = indexedDB.open(IDB, 1);
      open.onupgradeneeded = () => open.result.createObjectStore("kv");
      open.onerror = () => resolve(undefined);
      open.onsuccess = () => {
        try {
          const req = fn(open.result.transaction("kv", mode).objectStore("kv"));
          req.onsuccess = () => resolve(req.result as T);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      };
    } catch {
      resolve(undefined);
    }
  });
}
const tokenStore = {
  async load(): Promise<string | null> {
    let t: string | null = null;
    try {
      t = localStorage.getItem(KEY);
    } catch {}
    if (!t) t = (await idb<string>("readonly", (s) => s.get(KEY))) ?? null;
    if (!t) t = document.cookie.match(/(?:^|; )anton_session=([^;]+)/)?.[1] ?? null;
    if (t) void tokenStore.save(t); // heal whichever copies were lost
    return t;
  },
  async save(t: string) {
    try {
      localStorage.setItem(KEY, t);
    } catch {}
    document.cookie = `anton_session=${t}; path=/; max-age=${400 * 86400}; secure; samesite=strict`;
    await idb("readwrite", (s) => s.put(t, KEY));
  },
  async clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    document.cookie = "anton_session=; path=/; max-age=0; secure; samesite=strict";
    await idb("readwrite", (s) => s.delete(KEY));
  },
};

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
        // Only sign out if Anton itself confirms the session is gone (not a stray 401 from elsewhere).
        const check = await fetch(API + "/api/me", { headers: { Authorization: `Bearer ${session}` } }).catch(() => null);
        if (check?.status === 401) {
          await tokenStore.clear();
          setSession(null);
        }
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
    if (token) {
      history.replaceState(null, "", location.pathname);
      fetch(`${API}/api/login/finish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok && d.session) {
            void tokenStore.save(d.session);
            setSession(d.session);
          } else setStatus(d.error || "That link didn't work.");
        })
        .catch(() => setStatus("Couldn't reach Anton."))
        .finally(() => setReady(true));
    } else {
      tokenStore.load().then((saved) => {
        setSession(saved);
        setReady(true);
      });
    }
  }, []);

  if (!ready) return <p className="mt-6 text-paper-muted">…</p>;
  if (!session)
    return (
      <SignIn
        status={status}
        onSession={(sess) => {
          void tokenStore.save(sess);
          setSession(sess);
        }}
      />
    );
  return (
    <Dashboard
      api={api}
      signOut={() => {
        void api("/api/logout", { method: "POST" }).catch(() => {});
        void tokenStore.clear();
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

// Every section of the dashboard. Add new areas here: they show up in the desktop sidebar and the phone's
// "more" sheet automatically, and can be pinned to the phone's bottom bar.
type Tab = "today" | "week" | "inbox" | "connections" | "chat" | "tickets" | "work";
const GROUPS = ["daily", "people", "build"] as const;
const SECTIONS: { id: Tab; label: string; Icon: typeof Sun; group: (typeof GROUPS)[number] }[] = [
  { id: "today", label: "today", Icon: Sun, group: "daily" },
  { id: "week", label: "week", Icon: CalendarDays, group: "daily" },
  { id: "inbox", label: "inbox", Icon: Mail, group: "people" },
  { id: "connections", label: "people", Icon: Users, group: "people" },
  { id: "chat", label: "chat", Icon: MessageCircle, group: "people" },
  { id: "tickets", label: "tickets", Icon: ListChecks, group: "build" },
  { id: "work", label: "work", Icon: Terminal, group: "build" },
];
const PIN_MAX = 4;
const DEFAULT_PINS: Tab[] = ["today", "inbox", "connections", "chat"];

function usePins(): [Tab[], (p: Tab[]) => void] {
  const [pins, set] = useState<Tab[]>(DEFAULT_PINS);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("anton:nav-pins") || "null");
      if (Array.isArray(s) && s.length) set(s);
    } catch {}
  }, []);
  return [pins, (p: Tab[]) => {
    set(p);
    try {
      localStorage.setItem("anton:nav-pins", JSON.stringify(p));
    } catch {}
  }];
}

function Dashboard({ api, signOut }: { api: Api; signOut: () => void }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [err, setErr] = useState("");
  const [running, setRunning] = useState("");
  const [tab, setTab] = useState<Tab>("today");
  const [more, setMore] = useState(false);
  const [qr, setQr] = useState(false);
  useEffect(() => {
    if (location.hash === "#qr") setQr(true); // the installed app's "My QR" shortcut
  }, []);
  const [pins, setPins] = usePins();
  const [yourMove, setYourMove] = useState(0);
  const [notes, setNotes] = useState(false);
  const [unread, setUnread] = useState(0);
  const markRead = useCallback(() => setUnread(0), []);
  useEffect(() => {
    api("/api/notifications").then((d) => setUnread(d.unread)).catch(() => {});
    api("/api/connections")
      .then((d) => setYourMove(d.connections.filter((c: { move: string | null }) => c.move === "you").length))
      .catch(() => {});
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
  }, [load]);

  // The open section lives in the URL (#/inbox), so links from pings and the back gesture work.
  useEffect(() => {
    const fromHash = () => {
      const id = location.hash.replace(/^#\/?/, "") as Tab;
      if (SECTIONS.some((t) => t.id === id)) {
        setTab(id);
        return true;
      }
      return false;
    };
    if (!fromHash()) {
      try {
        const saved = sessionStorage.getItem("anton:tab") as Tab | null;
        if (saved && SECTIONS.some((t) => t.id === saved)) setTab(saved);
      } catch {}
    }
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const pick = (t: Tab) => {
    setTab(t);
    setNotes(false);
    setMore(false);
    try {
      sessionStorage.setItem("anton:tab", t);
    } catch {}
    if (location.hash !== `#/${t}`) history.pushState(null, "", `#/${t}`);
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

  const connections = (
    <Section title="people">
      <ConnectionsPanel api={api} />
    </Section>
  );
  const full = (node: React.ReactNode) => (
    <div className="mt-4 h-[calc(100dvh-15rem-env(safe-area-inset-bottom))] min-h-[18rem] md:h-[calc(100vh-8rem)]">{node}</div>
  );
  const panes: Record<Tab, React.ReactNode> = {
    today,
    week,
    inbox,
    connections,
    chat: full(<AntonChat api={api} fill />),
    tickets: ticketsSection,
    work: full(<WorkPanel api={api} fill />),
  };
  const badges: Partial<Record<Tab, number>> = { tickets: tickets?.length ?? 0, connections: yourMove };
  const bar = pins.filter((id) => SECTIONS.some((t) => t.id === id)).slice(0, PIN_MAX);
  const offBar = !bar.includes(tab);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="ml-auto flex items-center gap-3 text-sm">
          <PushToggle api={api} />
          <button className="p-1 text-paper-muted hover:text-paper-accent" onClick={() => setQr(true)} aria-label="My QR code" title="My QR code">
            <QrCode className="h-5 w-5" />
          </button>
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
      {qr ? <MyQr onClose={() => { setQr(false); if (location.hash === "#qr") history.replaceState(null, "", location.pathname); }} /> : null}

      <div className={notes ? "hidden" : "md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 lg:grid-cols-[10rem_minmax(0,1fr)_22rem]"}>
        {/* Desktop: sidebar of every section, grouped. */}
        <nav className="sticky top-4 mt-12 hidden self-start md:block" aria-label="Sections">
          {GROUPS.map((g) => (
            <div key={g} className="mb-5">
              <p className="mb-1 text-xs uppercase tracking-widest text-paper-muted/70">{g}</p>
              {SECTIONS.filter((t) => t.group === g).map(({ id, label, Icon }) => (
                <button key={id} onClick={() => pick(id)} aria-current={tab === id ? "page" : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-base ${tab === id ? "bg-white/5 text-paper-accent" : "text-paper-muted hover:text-white"}`}>
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {badges[id] ? <span className="rounded-full bg-paper-stamp px-1.5 text-[10px] leading-4 text-black">{badges[id]}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="min-w-0">{panes[tab]}</div>
        {/* Wide screens: chat stays beside whatever section is open. */}
        {tab !== "chat" ? (
          <div className="sticky top-4 mt-12 hidden h-[calc(100vh-6rem)] self-start lg:block">
            <AntonChat api={api} fill />
          </div>
        ) : null}
      </div>

      {/* Phone: pinned sections in the bottom bar, everything else under "more". */}
      {more ? (
        <MoreSheet tab={tab} pins={bar} setPins={setPins} badges={badges} pick={pick} onClose={() => setMore(false)} />
      ) : null}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid border-t border-white/15 bg-paper-bg pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{ gridTemplateColumns: `repeat(${bar.length + 1}, minmax(0, 1fr))` }}
        aria-label="Sections"
      >
        {bar.map((id) => {
          const { label, Icon } = SECTIONS.find((t) => t.id === id)!;
          return (
            <button key={id} onClick={() => pick(id)} aria-current={tab === id && !more ? "page" : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs ${tab === id && !more ? "text-paper-accent" : "text-paper-muted"}`}>
              <Icon className="h-5 w-5" />
              {label}
              {badges[id] ? (
                <span className="absolute right-[22%] top-1.5 rounded-full bg-paper-stamp px-1.5 text-[10px] leading-4 text-black">{badges[id]}</span>
              ) : null}
            </button>
          );
        })}
        <button onClick={() => setMore(!more)} aria-expanded={more}
          className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs ${more || offBar ? "text-paper-accent" : "text-paper-muted"}`}>
          <LayoutGrid className="h-5 w-5" />
          {offBar && !more ? SECTIONS.find((t) => t.id === tab)?.label : "more"}
        </button>
      </nav>
    </div>
  );
}

// Full-screen QR for people to scan: opens andor.us/connect (save Andor's contact or leave theirs).
function MyQr({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-paper-bg px-6" onClick={onClose}>
      <p className="font-hand text-5xl font-bold text-paper-accent">connect with Andor</p>
      <div className="rounded-2xl bg-white p-5">
        <QRCodeSVG value="https://andor.us/connect" size={260} level="M" />
      </div>
      <p className="text-paper-muted">andor.us/connect</p>
      <button className="mt-2 flex items-center gap-1 text-paper-muted hover:text-paper-accent"><X className="h-4 w-4" /> close</button>
    </div>
  );
}

function MoreSheet({ tab, pins, setPins, badges, pick, onClose }: {
  tab: Tab; pins: Tab[]; setPins: (p: Tab[]) => void; badges: Partial<Record<Tab, number>>; pick: (t: Tab) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const toggle = (id: Tab) =>
    setPins(pins.includes(id) ? pins.filter((x) => x !== id) : pins.length >= PIN_MAX ? pins : [...pins, id]);
  return (
    <>
      <button className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-label="Close" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-50 rounded-t-2xl border-t border-white/15 bg-paper-bg px-5 pb-4 pt-3 md:hidden">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm uppercase tracking-widest text-paper-muted">{editing ? `pick up to ${PIN_MAX} for the bar` : "all sections"}</p>
          <button className="text-sm text-paper-accent" onClick={() => setEditing(!editing)}>{editing ? "done" : "edit bar"}</button>
        </div>
        {GROUPS.map((g) => (
          <div key={g} className="mt-3">
            <p className="mb-1.5 text-xs uppercase tracking-widest text-paper-muted/70">{g}</p>
            <div className="grid grid-cols-4 gap-2">
              {SECTIONS.filter((t) => t.group === g).map(({ id, label, Icon }) => {
                const pinned = pins.includes(id);
                return (
                  <button key={id} onClick={() => (editing ? toggle(id) : pick(id))}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border py-3 text-xs ${
                      editing ? (pinned ? "border-paper-accent text-paper-accent" : "border-white/10 text-paper-muted")
                        : tab === id ? "border-paper-accent/60 text-paper-accent" : "border-white/10 text-paper-body"}`}>
                    <Icon className="h-5 w-5" />
                    {label}
                    {editing && pinned ? <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5" /> : null}
                    {!editing && badges[id] ? (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-paper-stamp px-1.5 text-[10px] leading-4 text-black">{badges[id]}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
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
  const [working, setWorking] = useState<string[]>([]);
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
  const resolve = async (t: Ticket) => {
    try {
      await api(`/api/tickets/${t.id}/resolve`, { method: "POST" });
      setWorking((w) => [...w, t.id]);
    } catch (e) {
      alert((e as Error).message);
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
              {working.includes(t.id) ? <span className="text-paper-accent">Anton is on it…</span> : null}
            </div>
          </div>
          <button
            className="rounded-md p-2.5 text-paper-muted hover:bg-white/5 hover:text-paper-accent disabled:opacity-40"
            disabled={working.includes(t.id)}
            onClick={() => resolve(t)}
            aria-label={`Have Anton resolve ${t.id}`}
            title="Have Anton try to resolve it"
          >
            <Bot className="h-5 w-5" />
          </button>
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
