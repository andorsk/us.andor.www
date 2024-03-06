"use client";
import { Home as HomeView } from "@/views/home";
import { AIAssistant } from "@/components/ai-assistant";
import { UseWeb5 } from "@/components/web5";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex w-full flex-col items-center justify-between">
        <AIAssistant />
        <div className="flex w-full flex-col items-center justify-between">
          Your Decentralized Identifier: <UseWeb5 />
        </div>
        <HomeView />
      </div>
    </main>
  );
}
