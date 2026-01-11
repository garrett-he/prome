import { describe, expect, it } from "vitest";
import router, { routes } from "../src/router/index";

describe("router", () => {
    it("creates router with all routes", () => {
        expect(router).toBeDefined();
        expect(routes).toHaveLength(5);
    });

    it("welcome route has correct path", () => {
        expect(routes[0].path).toBe("/");
        expect(routes[0].element).toBeDefined();
    });

    it("vault route has correct path", () => {
        expect(routes[1].path).toBe("/vault");
        expect(routes[1].element).toBeDefined();
    });

    it("new prompt route has correct path", () => {
        expect(routes[2].path).toBe("/vault/prompts/new");
        expect(routes[2].element).toBeDefined();
    });

    it("prompt detail route has correct path", () => {
        expect(routes[3].path).toBe("/vault/prompts/:id");
        expect(routes[3].element).toBeDefined();
    });

    it("prompt edit route has correct path", () => {
        expect(routes[4].path).toBe("/vault/prompts/:id/edit");
        expect(routes[4].element).toBeDefined();
    });
});
