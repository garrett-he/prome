import { open } from "@tauri-apps/plugin-dialog";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/stores/app";

export function VaultSwitcher() {
    const { currentVault, recentVaults, openVault, createVault, closeVault } = useAppStore(
        useShallow((s) => ({
            currentVault: s.currentVault,
            recentVaults: s.recentVaults,
            openVault: s.openVault,
            createVault: s.createVault,
            closeVault: s.closeVault,
        })),
    );
    const navigate = useNavigate();

    const handleNew = async () => {
        const dir = await open({
            multiple: false,
            directory: true,
            title: "Select or create a folder for your vault",
        });
        if (dir) {
            await createVault(dir);
        }
    };

    const handleOpen = async () => {
        const dir = await open({
            multiple: false,
            directory: true,
            title: "Select a vault folder",
        });
        if (dir) {
            await openVault(dir);
        }
    };

    const handleSwitch = async (path: string) => {
        await openVault(path);
    };

    const handleClose = async () => {
        await closeVault();
        navigate("/");
    };

    if (!currentVault) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md bg-accent px-3 py-2 text-sm font-semibold">
                <span>{currentVault.name}</span>
                <span className="text-muted-foreground">&#9662;</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {recentVaults
                    .filter((v) => v.path !== currentVault.path)
                    .map((vault) => (
                        <DropdownMenuItem key={vault.path} onClick={() => handleSwitch(vault.path)}>
                            {vault.name}
                        </DropdownMenuItem>
                    ))}
                {recentVaults.length > 1 && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={handleNew}>New Vault...</DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpen}>Open Vault...</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClose} className="text-destructive">
                    Close Current Vault
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
