import type { Metadata } from "next";
import DefaultLayout from "@/layouts/DefaultLayout";
import { cv } from "@/lib/data/cv";
import PrintButton from "./print-button";

export const metadata: Metadata = {
  title: "CV",
  description: `${cv.name}: ${cv.headline}`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cv-section mt-12">
      <h2 className="cv-h2 font-hand text-4xl font-bold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// On screen: notebook styling. On print: globals.css `.cv` rules swap to a plain, ATS-friendly page.
export default function CV() {
  return (
    <DefaultLayout>
      <main className="cv mx-auto max-w-3xl px-5 pt-12 text-base sm:pt-16 sm:text-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <span className="text-paper-muted">curriculum vitae</span>
          <div className="flex gap-3">
            <a href="/cv.md" className="rounded-md border-2 border-white/30 px-3 py-1 font-hand text-xl text-paper-muted">
              markdown
            </a>
            <PrintButton />
          </div>
        </div>

        <header className="mt-6">
          <h1 className="cv-h1 font-hand text-6xl font-bold leading-none text-white sm:text-7xl">{cv.name}</h1>
          <p className="mt-3 text-paper-body">{cv.headline}</p>
          <p className="cv-contact mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-paper-muted">
            <span>{cv.location}</span>
            {cv.contact.map((c) => (
              <a key={c.label} href={c.url} className="text-paper-accent">
                {c.text}
              </a>
            ))}
          </p>
        </header>

        <Section title="Summary">
          <p className="leading-relaxed text-paper-body">{cv.summary}</p>
        </Section>

        <Section title="Selected impact">
          <ul className="space-y-1.5">
            {cv.impact.map((i) => (
              <li key={i} className="flex gap-3 text-paper-body">
                <span className="text-paper-accent">✓</span>
                {i}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Experience">
          <ol className="space-y-7">
            {cv.experience.map((r) => (
              <li key={r.org} className="cv-role">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="cv-org font-hand text-3xl font-bold text-white">
                      {r.org}
                    </a>
                  ) : (
                    <span className="cv-org font-hand text-3xl font-bold text-white">{r.org}</span>
                  )}
                  <span className="text-paper-body">{r.title}</span>
                  {r.tag && (
                    <span className="cv-tag -rotate-2 rounded-md border-2 border-paper-stamp px-1.5 text-sm text-paper-stamp">{r.tag}</span>
                  )}
                </div>
                <div className="text-sm text-paper-muted">{[r.dates, r.location].filter(Boolean).join(" · ")}</div>
                {r.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-paper-body marker:text-paper-muted">
                    {r.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Standards & leadership">
          <ul className="list-disc space-y-1 pl-5 text-paper-body marker:text-paper-muted">
            {cv.standards.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>

        <Section title="Research & speaking">
          <ul className="list-disc space-y-1 pl-5 text-paper-body marker:text-paper-muted">
            {cv.research.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>

        <Section title="Education & certifications">
          <ul className="list-disc space-y-1 pl-5 text-paper-body marker:text-paper-muted">
            {cv.education.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>

        <Section title="Skills">
          <dl className="space-y-1 text-paper-body">
            {cv.skills.map((s) => (
              <div key={s.label}>
                <dt className="inline font-bold text-white">{s.label}: </dt>
                <dd className="inline">{s.items}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-paper-muted">{cv.languages}</p>
        </Section>
      </main>
    </DefaultLayout>
  );
}
