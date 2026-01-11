import { WelcomePage } from "@/components/vault/WelcomePage";
import { useAppStore } from "@/stores/app";

export function WelcomeView() {
    const initialized = useAppStore((s) => s.initialized);

    if (!initialized) return null;

    return <WelcomePage />;
}
