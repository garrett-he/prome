import { describe, expect, it } from "vitest";
import router, { routes } from "../src/router/index";

describe("router", () => {
    it("creates router with home route", () => {
        expect(router).toBeDefined();
        expect(routes).toHaveLength(1);
    });

    it("home route has correct path", () => {
        expect(routes[0].path).toBe("/");
        expect(routes[0].element).toBeDefined();
    });
});
