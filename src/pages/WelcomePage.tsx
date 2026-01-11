import { WelcomePanel } from "@/components/vault/WelcomePanel";
import { useAppStore } from "@/stores/app";

export function WelcomePage() {
    const initialized = useAppStore((s) => s.initialized);

    if (!initialized) return null;

    return <WelcomePanel />;
}
