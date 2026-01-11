import { createMemoryRouter, type RouteObject } from "react-router-dom";
import { PromptDetailPage } from "@/pages/PromptDetailPage";
import { PromptEditPage } from "@/pages/PromptEditPage";
import { VaultPage } from "@/pages/VaultPage";
import { WelcomePage } from "@/pages/WelcomePage";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <WelcomePage />,
    },
    {
        path: "/vault",
        element: <VaultPage />,
    },
    {
        path: "/vault/prompts/new",
        element: <PromptEditPage />,
    },
    {
        path: "/vault/prompts/:id",
        element: <PromptDetailPage />,
    },
    {
        path: "/vault/prompts/:id/edit",
        element: <PromptEditPage />,
    },
];

const router = createMemoryRouter(routes, { initialEntries: ["/"] });

export function setInitialPath(path: string) {
    router.navigate(path, { replace: true });
}

export function getRouter() {
    return router;
}

export default router;
