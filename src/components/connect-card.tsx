"use client";

import { useState } from "react";
import { Check, Download, Github, Globe, Linkedin, Loader2, Send } from "lucide-react";

const API = process.env.NEXT_PUBLIC_ANTON_API || "https://ubuntu-dev.tail89681.ts.net";
const btn =
  "flex items-center justify-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-base text-paper-body hover:border-paper-accent hover:text-paper-accent";
const field =
  "w-full rounded-md border border-white/20 bg-transparent px-3 py-2.5 text-base text-white placeholder:text-paper-muted focus:border-paper-accent focus:outline-none";

export default function ConnectCard() {
  const [f, setF] = useState({ name: "", email: "", phone: "", note: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setErr("");
    try {
      const r = await fetch(`${API}/api/connect`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong. Try again?");
      setState("done");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  };

  return (
    <section className="mt-6 sm:mt-12">
      <h1 className="font-hand text-6xl font-bold text-paper-accent">Andor Kesselman</h1>
      <p className="mt-2 text-lg text-paper-muted">Andor Labs · andor.us</p>

      <div className="mt-6 grid gap-3">
        <a href="/card.vcf" download="Andor Kesselman.vcf" className="flex items-center justify-center gap-2 rounded-md border border-paper-accent bg-paper-accent px-4 py-2.5 text-base font-medium text-black hover:opacity-90">
          <Download className="h-5 w-5" /> Save my contact
        </a>
        <div className="grid grid-cols-3 gap-3">
          <a className={btn} href="https://www.linkedin.com/in/andorsk/" target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /> <span className="sr-only sm:not-sr-only">LinkedIn</span></a>
          <a className={btn} href="https://github.com/andorsk" target="_blank" rel="noopener noreferrer"><Github className="h-5 w-5" /> <span className="sr-only sm:not-sr-only">GitHub</span></a>
          <a className={btn} href="/"><Globe className="h-5 w-5" /> <span className="sr-only sm:not-sr-only">Site</span></a>
        </div>
      </div>

      <h2 className="mt-10 font-hand text-4xl font-bold text-paper-accent">leave yours</h2>
      {state === "done" ? (
        <p className="mt-3 flex items-center gap-2 text-lg text-paper-body">
          <Check className="h-5 w-5 text-paper-accent" /> Thanks{f.name ? `, ${f.name.split(" ")[0]}` : ""}! Andor has your details.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-3">
          <input className={field} placeholder="Your name" value={f.name} onChange={set("name")} required maxLength={80} autoComplete="name" />
          <input className={field} placeholder="Email" type="email" value={f.email} onChange={set("email")} maxLength={120} autoComplete="email" />
          <input className={field} placeholder="Phone (optional)" type="tel" value={f.phone} onChange={set("phone")} maxLength={30} autoComplete="tel" />
          <textarea className={`${field} min-h-[5rem]`} placeholder="Where we met / what you're working on (optional)" value={f.note} onChange={set("note")} maxLength={500} />
          {/* honeypot: hidden from people, bots fill it in */}
          <input className="hidden" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} aria-hidden="true" />
          {err ? <p className="text-paper-stamp">{err}</p> : null}
          <button className={`${btn} border-paper-accent text-paper-accent`} disabled={state === "sending"}>
            {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Send to Andor
          </button>
          <p className="text-sm text-paper-muted">Only Andor sees this. It goes to his own contact list, nowhere else.</p>
        </form>
      )}
    </section>
  );
}
