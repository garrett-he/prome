import { invoke } from "@tauri-apps/api/core";
import { type FormEvent, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function HomeView() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const msg = await invoke("greet", { name });
            setGreetMsg(msg);
        },
        [name],
    );

    return (
        <main className="container mx-auto flex flex-col items-center pt-[10vh] text-center">
            <h1 className="mb-8 text-3xl font-bold">Welcome to Tauri + React</h1>

            <div className="mb-6 flex justify-center gap-6">
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img
                        src="/vite.svg"
                        className="logo h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_2em_#747bff]"
                        alt="Vite logo"
                    />
                </a>
                <a href="https://tauri.app" target="_blank" rel="noreferrer">
                    <img
                        src="/tauri.svg"
                        className="logo h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_2em_#24c8db]"
                        alt="Tauri logo"
                    />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img
                        src="/react.svg"
                        className="logo h-24 p-6 transition-all duration-700 hover:drop-shadow-[0_0_2em_#61dafb]"
                        alt="React logo"
                    />
                </a>
            </div>

            <p className="mb-8 text-muted-foreground">Click on the Tauri, Vite, and React logos to learn more.</p>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Greet</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            id="greet-input"
                            placeholder="Enter a name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Button type="submit">Greet</Button>
                    </form>
                    {greetMsg && <p className="mt-4 text-sm">{greetMsg}</p>}
                </CardContent>
            </Card>
        </main>
    );
}
