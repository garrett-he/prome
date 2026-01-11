import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/stores/app";
import router, { setInitialPath } from "./router";

export function App() {
    const initVault = useAppStore((s) => s.initVault);

    useEffect(() => {
        (async () => {
            await initVault();
            const { currentVault } = useAppStore.getState();
            setInitialPath(currentVault ? "/vault" : "/");
        })();
    }, [initVault]);

    return (
        <>
            <RouterProvider router={router} />
            <Toaster />
        </>
    );
}
