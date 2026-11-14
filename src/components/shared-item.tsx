"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare, Send, StickyNote } from "lucide-react";

const API = process.env.NEXT_PUBLIC_ANTON_API || "https://ubuntu-dev.tail89681.ts.net";
type C = { id: number; name: string; kind: "comment" | "note" | "reaction"; text: string; at: string; owner: boolean };
type Item = { title: string; kind: string; html: string; updated_at: string; owner: string; comments: C[]; reactions: string[] };

const field =
  "w-full rounded-md border border-white/20 bg-transparent px-3 py-2.5 text-base text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none";

function when(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// One shared item: what Andor shared (rendered on Anton's side from Markdown), then quick reactions, comments and
// notes from whoever has the link. Your name is remembered on this browser so the next comment is one step.
export default function SharedItem() {
  const [token, setToken] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [kind, setKind] = useState<"comment" | "note">("comment");
  const [sending, setSending] = useState("");

  const load = useCallback(async (k: string) => {
    try {
      const r = await fetch(`${API}/api/public/shared/${encodeURIComponent(k)}`);
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "This link isn't working.");
      setItem(d);
      setErr("");
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("k") || "";
    setToken(k);
    try { setName(localStorage.getItem("shared_name") || ""); } catch { /* private mode */ }
    if (!k) { setErr("This link is missing its key."); return; }
    void load(k);
    const t = setInterval(() => void load(k), 20000); // new comments show up without a reload
    return () => clearInterval(t);
  }, [load]);

  const post = async (k: "comment" | "note" | "reaction", body: string) => {
    if (!name.trim()) { setErr("Add your name first, so Andor knows who it's from."); return; }
    setSending(k === "reaction" ? body : k);
    setErr("");
    try {
      try { localStorage.setItem("shared_name", name.trim()); } catch { /* private mode */ }
      const r = await fetch(`${API}/api/public/shared/${encodeURIComponent(token)}/comment`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), kind: k, text: body }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Couldn't send that. Try again?");
      setItem((it) => (it ? { ...it, comments: [...it.comments, d] } : it));
      if (k !== "reaction") setText("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSending("");
    }
  };

  if (!item) {
    return (
      <section className="mt-10 text-lg text-paper-muted">
        {err ? <p>{err}</p> : <p className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</p>}
      </section>
    );
  }
  const reactions = item.comments.filter((c) => c.kind === "reaction");
  const talk = item.comments.filter((c) => c.kind !== "reaction");
  const tally = item.reactions.map((r) => ({ r, n: reactions.filter((c) => c.text === r).length }));

  return (
    <section className="mt-6 sm:mt-10">
      <p className="text-sm uppercase tracking-widest text-paper-muted">{item.owner} shared · {when(item.updated_at)}</p>
      <h1 className="mt-1 font-hand text-5xl font-bold text-paper-accent">{item.title}</h1>
      <article className="mt-6 text-lg leading-relaxed text-paper-body [&_a]:text-paper-accent [&_a]:underline [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:text-white [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:text-white [&_h3]:mt-4 [&_h3]:text-white [&_li]:mt-1 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_strong]:text-white [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1"
        dangerouslySetInnerHTML={{ __html: item.html }} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tally.map(({ r, n }) => (
          <button key={r} onClick={() => void post("reaction", r)} disabled={!!sending}
            className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-lg hover:border-paper-accent disabled:opacity-50">
            {sending === r ? <Loader2 className="h-4 w-4 animate-spin" /> : r}
            {n ? <span className="text-sm text-paper-muted">{n}</span> : null}
          </button>
        ))}
      </div>

      <h2 className="mt-10 font-hand text-3xl font-bold text-paper-accent">comments</h2>
      <ul className="mt-3 grid gap-3">
        {talk.length ? talk.map((c) => (
          <li key={c.id} className={`rounded-md border px-4 py-3 ${c.owner ? "border-paper-accent/60" : "border-white/15"}`}>
            <p className="text-sm text-paper-muted">
              <span className={c.owner ? "text-paper-accent" : "text-paper-body"}>{c.name}</span>
              {c.kind === "note" ? " · note" : ""} · {when(c.at)}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-base text-white">{c.text}</p>
          </li>
        )) : <li className="text-paper-muted">No comments yet. Be the first.</li>}
      </ul>

      <form className="mt-6 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void post(kind, text.trim()); }}>
        <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        <textarea className={`${field} min-h-[96px]`} placeholder={kind === "note" ? "A note for Andor (add context, a correction, a link…)" : "Say something…"}
          value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setKind("comment")}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${kind === "comment" ? "border-paper-accent text-paper-accent" : "border-white/20 text-paper-muted"}`}>
            <MessageSquare className="h-4 w-4" /> Comment
          </button>
          <button type="button" onClick={() => setKind("note")}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${kind === "note" ? "border-paper-accent text-paper-accent" : "border-white/20 text-paper-muted"}`}>
            <StickyNote className="h-4 w-4" /> Note
          </button>
          <span className="flex-1" />
          <button type="submit" disabled={!text.trim() || !!sending}
            className="flex items-center gap-2 rounded-md border border-paper-accent bg-paper-accent px-4 py-2 text-base font-medium text-black hover:opacity-90 disabled:opacity-50">
            {sending === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
          </button>
        </div>
        {err ? <p className="text-sm text-red-300">{err}</p> : null}
      </form>
      <p className="mt-8 text-xs text-paper-muted">Anyone with this link can read it and comment. Andor gets your comments.</p>
    </section>
  );
}
