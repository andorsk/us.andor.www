import type { Metadata } from "next";
import DefaultLayout from "@/layouts/DefaultLayout";
import ControlPlane from "@/components/control-plane";

export const metadata: Metadata = {
  title: "control plane",
  robots: { index: false, follow: false },
};

// Private dashboard for Andor (Anton's feed, tickets, chat). Everything loads client-side after sign-in.
export default function MePage() {
  return (
    <DefaultLayout>
      <main className="mx-auto max-w-3xl px-5 sm:text-xl">
        <section className="mt-14 sm:mt-20">
          <ControlPlane />
        </section>
      </main>
    </DefaultLayout>
  );
}
