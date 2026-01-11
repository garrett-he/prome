declare module "@tauri-apps/api/core" {
    export function invoke(cmd: "greet", args: { name: string }): Promise<string>;
}
