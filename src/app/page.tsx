import { Home as HomeView } from "@/views/home";
import { AIAssistant } from "@/components/ai-assistant";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className=" flex w-full flex-col items-center justify-between">
        <AIAssistant />
        <HomeView />
      </div>
    </main>
  );
}
