import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/stores/app";
import router, { setInitialPath } from "./router";

export function App() {
    const initVault = useAppStore((s) => s.initVault);
    const initLanguage = useAppStore((s) => s.initLanguage);

    useEffect(() => {
        (async () => {
            await initLanguage();
            await initVault();
            const { currentVault } = useAppStore.getState();
            setInitialPath(currentVault ? "/vault" : "/");
        })();
    }, [initVault, initLanguage]);

    return (
        <>
            <RouterProvider router={router} />
            <Toaster />
        </>
    );
}
