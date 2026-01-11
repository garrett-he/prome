import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomeView } from "../src/views/HomeView";

vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

const mockedInvoke = vi.mocked(invoke);

describe("HomeView", () => {
    it("renders title and form elements", () => {
        render(<HomeView />);

        expect(screen.getByText("Welcome to Tauri + React")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter a name...")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Greet" })).toBeTruthy();
    });

    it("updates name on input", async () => {
        const user = userEvent.setup();
        render(<HomeView />);
        const input = screen.getByPlaceholderText("Enter a name...");

        await user.type(input, "Alice");

        expect(input).toHaveValue("Alice");
    });

    it("calls invoke on form submit and displays greeting", async () => {
        const user = userEvent.setup();
        mockedInvoke.mockResolvedValueOnce("Hello, Bob! You've been greeted from Rust!");

        render(<HomeView />);
        const input = screen.getByPlaceholderText("Enter a name...");
        const button = screen.getByRole("button", { name: "Greet" });

        await user.type(input, "Bob");
        await user.click(button);

        expect(mockedInvoke).toHaveBeenCalledWith("greet", { name: "Bob" });
        expect(mockedInvoke).toHaveBeenCalledTimes(1);

        expect(await screen.findByText("Hello, Bob! You've been greeted from Rust!")).toBeTruthy();
    });

    it("displays empty greeting initially", () => {
        render(<HomeView />);
        expect(screen.queryByText(/You've been greeted from Rust/)).not.toBeTruthy();
    });
});
