import { createBrowserRouter } from "react-router-dom";
import { HomeView } from "../views/HomeView";

export const routes = [
    {
        path: "/",
        element: <HomeView />,
    },
];

const router = createBrowserRouter(routes);

export default router;
