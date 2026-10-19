import DefaultLayout from "@/layouts/DefaultLayout";
import Swarm from "@/components/notebook/swarm";
import { intro, work } from "@/lib/data/home";

// Home: Andor Labs notebook. Lines write themselves in; a swarm of agents forms an & behind.
const at = (s: number) => ({ animationDelay: `${s}s` });

export default function Home() {
  return (
    <>
      <Swarm />
      <DefaultLayout>
        <main className="mx-auto max-w-2xl px-5 sm:text-xl">
          <section className="mt-14 sm:mt-20">
            <div className="nb-write text-base text-paper-muted" style={at(0.3)}>notebook · vol. &amp;</div>
            <h1 className="relative mt-1 inline-block font-hand text-6xl font-bold leading-none text-white sm:text-8xl">
              <span className="nb-write inline-block" style={at(0.6)}>Andor Labs</span>
              <svg className="absolute -bottom-3 left-0 h-4 w-full" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden>
                <path
                  className="nb-draw"
                  style={at(1.5)}
                  d="M2 10 C 60 4, 120 14, 180 8 S 270 6, 298 9"
                  fill="none"
                  stroke="#fbb040"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p className="nb-write mt-8 max-w-xl leading-relaxed text-paper-body" style={at(2.2)}>
              {intro}{" "}
              <a href="/about" className="whitespace-nowrap text-paper-accent">
                more about me →
              </a>
            </p>
          </section>

          <section className="mt-12 space-y-7">
            {work.map((w, i) => (
              <a
                key={w.name}
                href={w.url}
                target={w.url && "_blank"}
                rel="noopener noreferrer"
                className={`group block hover:text-inherit ${w.url ? "" : "pointer-events-none"}`}
              >
                <div className="nb-write flex flex-wrap items-baseline gap-x-3" style={at(2.9 + i * 0.45)}>
                  <span className="text-base text-paper-muted">exp. {String(i + 1).padStart(2, "0")}</span>
                  <span className="font-hand text-3xl font-bold text-white group-hover:text-paper-accent sm:text-4xl">{w.name}</span>
                  <span className="-rotate-2 rounded-md border-2 border-paper-stamp px-1.5 text-sm text-paper-stamp">{w.tag}</span>
                </div>
                <div className="nb-write text-paper-body sm:pl-[4.25rem]" style={at(3.1 + i * 0.45)}>{w.line}</div>
                {w.stack && (
                  <div className="nb-write mt-1 text-base text-paper-muted sm:pl-[4.25rem]" style={at(3.3 + i * 0.45)}>
                    {w.stack.join(" · ")}
                  </div>
                )}
              </a>
            ))}
            <div className="nb-write font-hand text-2xl text-paper-muted" style={at(2.9 + work.length * 0.45)}>
              exp. {String(work.length + 1).padStart(2, "0")} — in progress, etc…
            </div>
          </section>
        </main>
      </DefaultLayout>
    </>
  );
}
