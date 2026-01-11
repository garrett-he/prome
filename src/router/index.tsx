import { createMemoryRouter, type RouteObject } from "react-router-dom";
import { PromptDetailView } from "@/views/PromptDetailView";
import { PromptEditView } from "@/views/PromptEditView";
import { VaultView } from "@/views/VaultView";
import { WelcomeView } from "@/views/WelcomeView";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <WelcomeView />,
    },
    {
        path: "/vault",
        element: <VaultView />,
    },
    {
        path: "/vault/prompts/new",
        element: <PromptEditView />,
    },
    {
        path: "/vault/prompts/:id",
        element: <PromptDetailView />,
    },
    {
        path: "/vault/prompts/:id/edit",
        element: <PromptEditView />,
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
