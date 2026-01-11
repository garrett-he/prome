import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";

// Mock Tauri invoke so the Zustand store doesn't throw in jsdom.
vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn().mockResolvedValue([]),
}));

describe("App", () => {
    it("renders without errors", () => {
        const { container } = render(<App />);
        expect(container).toBeTruthy();
    });
});
