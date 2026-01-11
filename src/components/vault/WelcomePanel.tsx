import { open } from "@tauri-apps/plugin-dialog";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app";

export function WelcomePanel() {
    const { recentVaults, fetchRecentVaults, openVault, createVault, removeRecentVault } = useAppStore(
        useShallow((s) => ({
            recentVaults: s.recentVaults,
            fetchRecentVaults: s.fetchRecentVaults,
            openVault: s.openVault,
            createVault: s.createVault,
            removeRecentVault: s.removeRecentVault,
        })),
    );
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecentVaults();
    }, [fetchRecentVaults]);

    const handleNewVault = async () => {
        const dir = await open({
            multiple: false,
            directory: true,
            title: "Select or create a folder for your vault",
        });
        if (dir) {
            await createVault(dir);
            navigate("/vault");
        }
    };

    const handleOpenVault = async () => {
        const dir = await open({
            multiple: false,
            directory: true,
            title: "Select a vault folder",
        });
        if (dir) {
            await openVault(dir);
            navigate("/vault");
        }
    };

    const handleOpenRecent = async (path: string) => {
        await openVault(path);
        navigate("/vault");
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <div className="w-full max-w-md text-center">
                <h1 className="mb-2 text-4xl font-bold">Prome</h1>
                <p className="mb-8 text-muted-foreground">Manage your personal AI Prompt library</p>

                <div className="mb-8 flex justify-center gap-3">
                    <Button onClick={handleNewVault}>New Vault</Button>
                    <Button variant="outline" onClick={handleOpenVault}>
                        Open Vault
                    </Button>
                </div>

                {recentVaults.length > 0 && (
                    <div className="border-t pt-6 text-left">
                        <p className="mb-3 text-sm text-muted-foreground">Recent Vaults</p>
                        <div className="flex flex-col gap-2">
                            {recentVaults.map((vault) => (
                                <button
                                    key={vault.path}
                                    type="button"
                                    className="flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                                    onClick={() => handleOpenRecent(vault.path)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        removeRecentVault(vault.path);
                                    }}
                                >
                                    <div>
                                        <div className="font-medium">{vault.name}</div>
                                        <div className="text-xs text-muted-foreground">{vault.path}</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{vault.prompt_count} prompts</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
