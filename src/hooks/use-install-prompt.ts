import { useState, useEffect } from "react";

type InstallPrompt = {
  prompt: () => Promise<void>;
  outcome: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(
    null,
  );
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      console.log("beforeinstallprompt Event fired");
      setInstallPrompt(e as unknown as InstallPrompt);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstallPromptHandler,
      );
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return;
    const { prompt, outcome } = installPrompt;
    await prompt();
    const result = await outcome;
    setCanInstall(false);
  };

  return { canInstall, promptInstall };
};

export default useInstallPrompt;
