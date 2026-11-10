"use client";

// Andor's control plane: Anton's daily plan & news, open tickets, chat, push notifications.
// Talks to Anton's API (owner only). Sign-in: Anton DMs a one-time link on Slack (#login=<token>),
// which is exchanged for a 30-day session token kept in localStorage.
import { useCallback, useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_ANTON_API || "https://ubuntu-dev.tail89681.ts.net";
const KEY = "anton:session";

type Summary = { text: string; period: string; created_at: string } | null;
type Feed = { daily_briefing: Summary; weekly_briefing: Summary; digest: Summary; weekly_review: Summary };
type Ticket = { id: string; title: string; url: string; state: string; priority?: string; due?: string | null };
type Msg = { role: "user" | "assistant"; content: string };

// Slack mrkdwn → HTML. Escapes first; only http(s) links become anchors.
function mrkdwn(src: string): string {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    s
      .replace(/&lt;(https?:\/\/[^|&\s]+(?:&amp;[^|&\s]+)*)\|([^&]+?)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
      .replace(/&lt;(https?:\/\/[^&\s]+(?:&amp;[^&\s]+)*)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,:;!?]|$)/g, "$1<strong>$2</strong>")
      .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,:;!?]|$)/g, "$1<em>$2</em>");
  const out: string[] = [];
  let list = false;
  for (const raw of esc.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:•|-|◦|\d+\.)\s+(.*)$/);
    if (bullet) {
      if (!list) out.push("<ul>");
      list = true;
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    if (list) out.push("</ul>");
    list = false;
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("");
}

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
      <p className="mt-4 text-paper-body">This page is private. Anton will send a one-time sign-in link to its owner.</p>
      <button
        className={`${btn} mt-6`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await fetch(`${API}/api/login/start`, { method: "POST" });
            const d = await r.json().catch(() => ({}));
            setMsg(r.ok ? "Sent. Open the link from Slack on this device." : d.error || "Couldn't send a link.");
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
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-white/20 pb-2">
        <h2 className="font-hand text-3xl font-bold text-paper-accent">{title}</h2>
        <div className="text-base text-paper-muted">{right}</div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Dashboard({ api, signOut }: { api: Api; signOut: () => void }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [err, setErr] = useState("");
  const [running, setRunning] = useState("");

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
    void load();
  }, [load]);

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

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-hand text-5xl font-bold leading-none text-white sm:text-6xl">control plane</h1>
        <div className="flex gap-4">
          <PushToggle api={api} />
          <button className={quiet} onClick={signOut}>
            sign out
          </button>
        </div>
      </div>
      {err ? <p className="mt-4 text-paper-stamp">{err}</p> : null}

      <Section
        title="today"
        right={
          <>
            {daily ? `${ago(daily.created_at)} · ` : ""}
            <button className={quiet} disabled={!!running} onClick={() => refresh("daily")}>
              {running === "daily" ? "working…" : "refresh"}
            </button>
          </>
        }
      >
        {daily ? (
          <article className="mdx share-article" dangerouslySetInnerHTML={{ __html: mrkdwn(daily.text) }} />
        ) : (
          <p className="text-paper-muted">No briefing yet. Hit refresh, or wait for the morning one.</p>
        )}
      </Section>

      <Section title="tickets" right={tickets ? `${tickets.length} open` : ""}>
        <Tickets api={api} tickets={tickets} setTickets={setTickets} />
      </Section>

      <Section title="ask anton">
        <Chat api={api} />
      </Section>

      <Section
        title="week ahead"
        right={
          <>
            {weekly ? `${ago(weekly.created_at)} · ` : ""}
            <button className={quiet} disabled={!!running} onClick={() => refresh("weekly")}>
              {running === "weekly" ? "working…" : "refresh"}
            </button>
          </>
        }
      >
        {weekly ? (
          <Collapsible html={mrkdwn(weekly.text)} />
        ) : (
          <p className="text-paper-muted">Comes every Sunday evening.</p>
        )}
      </Section>

      {feed?.digest ? (
        <Section title="inbox digest" right={ago(feed.digest.created_at)}>
          <Collapsible html={mrkdwn(feed.digest.text)} />
        </Section>
      ) : null}
    </div>
  );
}

function Collapsible({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <article
        className={`mdx share-article ${open ? "" : "max-h-64 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
        <li key={t.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
          <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-mono text-base text-paper-muted hover:text-paper-accent">
            {t.id}
          </a>
          <span className="min-w-0 flex-1 text-paper-body">
            {t.title}
            {t.due ? <span className="ml-2 text-base text-paper-stamp">due {t.due}</span> : null}
          </span>
          <span className="flex gap-3">
            <button className={quiet} disabled={busy === t.id} onClick={() => act(t, "done")}>
              done
            </button>
            <button className={quiet} disabled={busy === t.id} onClick={() => act(t, "canceled")}>
              drop
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Chat({ api }: { api: Api }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api("/api/chat")
      .then((d) => setMsgs((d.messages as Msg[]).slice(-12)))
      .catch(() => {});
  }, [api]);
  useEffect(() => end.current?.scrollIntoView({ block: "nearest" }), [msgs]);

  const send = async () => {
    const m = text.trim();
    if (!m || busy) return;
    setText("");
    setMsgs((x) => [...x, { role: "user", content: m }]);
    setBusy(true);
    try {
      const d = await api("/api/chat", { method: "POST", body: JSON.stringify({ message: m }) });
      setMsgs((x) => [...x, { role: "assistant", content: d.reply }]);
    } catch (e) {
      setMsgs((x) => [...x, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-auto max-w-[85%] rounded-md border border-dashed border-white/20 px-3 py-2 text-right text-paper-body">
              {m.content}
            </p>
          ) : (
            <article key={i} className="mdx share-article max-w-[95%]" dangerouslySetInnerHTML={{ __html: mrkdwn(m.content) }} />
          ),
        )}
        {busy ? <p className="text-paper-muted">anton is thinking…</p> : null}
        <div ref={end} />
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ask about email, calendar, tickets, anything…"
          aria-label="Message Anton"
          className="min-w-0 flex-1 rounded-md border border-dashed border-white/30 bg-transparent px-3 py-2 text-base text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none"
        />
        <button type="submit" className={btn} disabled={busy || !text.trim()}>
          send
        </button>
      </form>
    </div>
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
