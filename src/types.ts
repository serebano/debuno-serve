import type { Server as NodeServer } from 'node:http'
// @deno-types="npm:bun-types@1.1.42"
import type { Server as BunServer } from "bun"

export type ENV = 'deno' | 'bun' | 'node'

export type Servers = {
    deno: Deno.HttpServer,
    bun: BunServer,
    node: NodeServer
}

export type Server = Servers[ENV]

export type ServeModule<T = any> = {
    ENV: ENV
    Server: T
    serve: (options: ServeOptions) => Promise<T>
    readDir: (path: string) => Promise<string[]>
    readFile: (filePath: string) => Promise<BodyInit> | BodyInit
    writeFile: (filePath: string, data: any) => Promise<void>
}

export type ServeOptions = {
    port?: number,
    hostname?: string,
    onListen?: (addr: { port: number, hostname: string, url: URL }) => void,
    onError?: (error: Error) => void,
    fetch: (request: Request, ...args: any[]) => Promise<Response> | Response,
    signal?: AbortSignal
}