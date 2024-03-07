import React from "react";
import useInstallPrompt from "@/hooks/use-install-prompt";

const InstallPWAButton: React.FC = () => {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return <button onClick={() => promptInstall()}>Install App</button>;
};

export default InstallPWAButton;
