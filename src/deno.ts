import { type ServeOptions } from "./types.ts";
import { toLocalhost } from "./utils.ts";

export const ENV = "deno" as const

export function serve(options: ServeOptions): Deno.HttpServer {
    const { port, hostname } = options

    return Deno.serve({
        port,
        hostname,
        handler: options.fetch,
        onListen: (addr) => options.onListen?.({
            port: addr.port,
            hostname: addr.hostname,
            url: new URL(`http://${toLocalhost(addr.hostname)}:${addr.port}`)
        }),
        onError(error: any) {
            options.onError?.(error)
            return Response.json({ error: error.message }, { status: 500 })
        },
        signal: options.signal
    })
}

export function symlink(target: string, path: string): Promise<void> {
    return Deno.symlink(target, path)
}

export function readFile(filePath: string): Promise<Uint8Array> {
    return Deno.readFile(filePath.replace('file://', ''))
}

export function writeFile(filePath: string, data: Uint8Array | string): Promise<void> {
    return Deno.writeFile(filePath.replace('file://', ''), typeof data === 'string' ? new TextEncoder().encode(data) : data)
}

export async function readDir(dirPath: string): Promise<string[]> {
    //@ts-ignore .
    const { walk } = await import("jsr:@std/fs@1.0.8/walk")
    dirPath = dirPath.replace('file://', '')
    const dirs = await Array.fromAsync(walk(dirPath));

    return dirs.filter((dir: any) => dir.isFile)
        .map((file: any) => file.path.replace(dirPath, ''))
        .map(filePath => filePath.startsWith('/') ? filePath.slice(1) : filePath)
}