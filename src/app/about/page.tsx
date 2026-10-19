import type { Metadata } from "next";
import DefaultLayout from "@/layouts/DefaultLayout";
import { social } from "@/lib/data/home";
import { thesis, timeline, questions, howIWork, offTheClock, dog } from "@/lib/data/about";

export const metadata: Metadata = {
  title: "About",
  description: "Multi-founder CTO focused on aligning a world full of agents with a world full of humans.",
};

const at = (s: number) => ({ animationDelay: `${s}s` });

function Heading({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <h2 className="nb-write font-hand text-4xl font-bold text-white sm:text-5xl" style={at(delay)}>
      {children}
    </h2>
  );
}

export default function About() {
  return (
    <DefaultLayout>
      <main className="mx-auto max-w-2xl px-5 sm:text-xl">
        <section className="mt-14 flex flex-col-reverse gap-8 sm:mt-20 sm:flex-row sm:items-start">
          <div className="flex-1">
            <div className="nb-write text-base text-paper-muted" style={at(0.2)}>lab notes · about · Presidio, San Francisco</div>
            <h1 className="nb-write mt-1 font-hand text-6xl font-bold leading-none text-white sm:text-7xl" style={at(0.4)}>
              Andor
            </h1>
            {thesis.map((p, i) => (
              <p key={i} className={`nb-write mt-6 leading-relaxed ${i === 0 ? "text-white" : "text-paper-body"}`} style={at(1 + i * 0.5)}>
                {p}
              </p>
            ))}
          </div>
          {/* Taped-in photo */}
          <figure className="nb-fade relative mx-auto w-48 shrink-0 rotate-3 bg-[#f4f1ea] p-2 pb-8 shadow-xl sm:w-52" style={at(0.8)}>
            <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-6 bg-paper-accent/60" aria-hidden />
            <img src="/imgs/hero-speaking.jpg" alt="Andor speaking on stage" className="aspect-square w-full object-cover grayscale" />
            <figcaption className="absolute bottom-1 left-0 right-0 text-center font-hand text-xl text-neutral-800">on stage</figcaption>
          </figure>
        </section>

        <section className="mt-16">
          <Heading delay={2}>the andorvector</Heading>
          <p className="nb-write mt-2 text-base text-paper-muted" style={at(2.2)}>
            my eigenvector: systems that understand people → systems people can trust → agents that act for people
          </p>
          <ol className="relative mt-8 space-y-6 border-l-2 border-dashed border-white/25 pl-6">
            {timeline.map((m, i) => (
              <li key={m.name} className="nb-write relative" style={at(2.4 + i * 0.15)}>
                <span className="absolute -left-[1.95rem] top-2 h-3 w-3 rounded-full border-2 border-paper-accent bg-paper-bg" aria-hidden />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  {m.when && <span className="text-base text-paper-muted">{m.when}</span>}
                  {m.url ? (
                    <a href={m.url} target={m.url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="font-hand text-3xl font-bold text-white">
                      {m.name}
                    </a>
                  ) : (
                    <span className="font-hand text-3xl font-bold text-white">{m.name}</span>
                  )}
                  {m.stamp && (
                    <span className="-rotate-2 rounded-md border-2 border-paper-stamp px-1.5 text-sm text-paper-stamp">{m.stamp}</span>
                  )}
                </div>
                <p className="text-base leading-relaxed text-paper-body sm:text-lg">{m.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <Heading delay={4.4}>open questions</Heading>
          <ul className="mt-6 space-y-4">
            {questions.map((q, i) => (
              <li key={q.q} className="nb-write flex gap-3" style={at(4.6 + i * 0.2)}>
                <span className="font-hand text-2xl leading-none text-paper-accent">?</span>
                <span>
                  <span className="text-white">{q.q}</span>{" "}
                  <span className="whitespace-nowrap text-base text-paper-muted">({q.tag})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <Heading delay={5.8}>how I work</Heading>
          <ul className="mt-6 space-y-2">
            {howIWork.map((line, i) => (
              <li key={line} className="nb-write flex gap-3 text-paper-body" style={at(6 + i * 0.2)}>
                <span className="text-paper-accent">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <Heading delay={6.8}>off the clock</Heading>
          <div className="nb-write mt-4 flex items-center gap-5" style={at(7)}>
            <a href={dog.url} target="_blank" rel="noopener noreferrer" className="shrink-0 -rotate-3 bg-[#f4f1ea] p-1.5 pb-5 shadow-lg">
              <img src={dog.photo} alt={`${dog.name}, a ${dog.breed}`} className="h-20 w-20 object-cover" />
            </a>
            <p className="leading-relaxed text-paper-body">
              Meet my dog{" "}
              <a href={dog.url} target="_blank" rel="noopener noreferrer" className="text-paper-accent">
                {dog.name}
              </a>
              , a {dog.breed} with his own Instagram.
            </p>
          </div>
          <p className="nb-write mt-4 leading-relaxed text-paper-body" style={at(7.2)}>
            Also: {offTheClock.map((o, i) => (
              <span key={o.url}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4">
                  {o.label}
                </a>
                {i < offTheClock.length - 2 ? ", " : i === offTheClock.length - 2 ? ", and " : "."}
              </span>
            ))}
          </p>
        </section>

        <section className="mt-16">
          <Heading delay={7.4}>say hi</Heading>
          <p className="nb-write mt-4 leading-relaxed text-paper-body" style={at(7.6)}>
            Especially if you&apos;re building agents, working on agent identity or delegation standards, or need a CTO-level hand.{" "}
            <a href="/cv" className="whitespace-nowrap text-paper-accent">
              read my CV →
            </a>
          </p>
          <ul className="nb-write mt-4 space-y-1 text-base text-paper-muted" style={at(7.8)}>
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.url} className="text-paper-accent">
                  {s.label.toLowerCase()}: {s.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </DefaultLayout>
  );
}
