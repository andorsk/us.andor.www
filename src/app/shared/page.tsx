import type { Metadata } from "next";
import DefaultLayout from "@/layouts/DefaultLayout";
import SharedItem from "@/components/shared-item";

export const metadata: Metadata = {
  title: "Shared with you",
  description: "Something Andor shared with you. Read it, comment, or react.",
  robots: { index: false, follow: false },
};

// andor.us/shared?k=TOKEN: one page for every item Andor shares from Anton. It's read live from Anton's API, so a new
// share works the moment it's made (no site build per share).
export default function SharedPage() {
  return (
    <DefaultLayout>
      <main className="mx-auto max-w-2xl px-5">
        <SharedItem />
      </main>
    </DefaultLayout>
  );
}
