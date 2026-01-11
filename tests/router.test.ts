import { describe, expect, it } from "vitest";
import router, { routes } from "../src/router/index";

const expectedPaths = [
    "/",
    "/settings",
    "/vault",
    "/vault/prompts/new",
    "/vault/prompts/:id",
    "/vault/prompts/:id/edit",
];

describe("router", () => {
    it("creates router with all routes", () => {
        expect(router).toBeDefined();
        expect(routes).toHaveLength(expectedPaths.length);
    });

    it("defines every expected route", () => {
        const paths = routes.map((r) => r.path);
        for (const expected of expectedPaths) {
            expect(paths).toContain(expected);
        }
    });

    it("assigns an element to every route", () => {
        for (const route of routes) {
            expect(route.path).toBeDefined();
            expect(route.element).toBeDefined();
        }
    });
});
