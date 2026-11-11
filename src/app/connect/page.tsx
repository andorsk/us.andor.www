import type { Metadata } from "next";
import DefaultLayout from "@/layouts/DefaultLayout";
import ConnectCard from "@/components/connect-card";

export const metadata: Metadata = {
  title: "Connect",
  description: "Save Andor's contact, or leave yours.",
  robots: { index: false, follow: false },
};

// Where Andor's QR code points: save his contact, find him online, or share your details with him.
export default function ConnectPage() {
  return (
    <DefaultLayout>
      <main className="mx-auto max-w-md px-5">
        <ConnectCard />
      </main>
    </DefaultLayout>
  );
}
