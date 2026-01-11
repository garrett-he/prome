import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";

// Replace BrowserRouter with MemoryRouter for jsdom compatibility
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        BrowserRouter: actual.MemoryRouter,
    };
});

describe("App", () => {
    it("renders without errors", () => {
        const { container } = render(<App />);
        expect(container).toBeTruthy();
    });

    it("renders the home view heading", () => {
        render(<App />);
        expect(screen.getByText("Welcome to Tauri + React")).toBeTruthy();
    });
});
