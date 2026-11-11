import type { Metadata } from "next";
import DefaultLayout from "@/layouts/DefaultLayout";
import ControlPlane from "@/components/control-plane";

export const metadata: Metadata = {
  title: "Anton",
  robots: { index: false, follow: false },
};

// Private dashboard for Andor (Anton's feed, tickets, chat). Everything loads client-side after sign-in.
export default function MePage() {
  return (
    <DefaultLayout>
      <main className="mx-auto max-w-3xl px-5 sm:text-xl md:max-w-5xl lg:max-w-7xl">
        <section className="mt-4 sm:mt-10">
          <ControlPlane />
        </section>
      </main>
    </DefaultLayout>
  );
}
