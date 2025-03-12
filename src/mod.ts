import type { ENV, Servers, ServeModule, ServeOptions } from "./types.ts";

const IS_DENO: boolean = navigator.userAgent.includes('Deno')
const IS_BUN: boolean = navigator.userAgent.includes('Bun')
const IS_NODE: boolean = navigator.userAgent.includes('Node')

export const Env = (() => {
    if (IS_DENO) return 'deno'
    if (IS_BUN) return 'bun'
    if (IS_NODE) return 'node'

    throw new Error('Unknown environment')
})()

type Serve = ServeModule<Servers[ENV]>

export const readDir: Serve['readDir'] = (...args) => import(`./${Env}.ts`).then(mod => mod.readDir(...args))
export const readFile: Serve['readFile'] = (...args) => import(`./${Env}.ts`).then(mod => mod.readFile(...args))
export const writeFile: Serve['writeFile'] = (...args) => import(`./${Env}.ts`).then(mod => mod.writeFile(...args))

export async function serve<T extends ENV>(options: ServeOptions): Promise<Servers[T]> {
    const start = performance.now()
    const serveModule = await import(`./${Env}.ts`) as ServeModule<Servers[T]>

    return serveModule.serve({
        ...options,
        onListen: async (addr) => {
            console.log(`(${navigator.userAgent}) ${addr.url}`, performance.now() - start, 'ms')
            options.onListen?.(addr)
        },
        onError: (error: any) => {
            console.error(`(serve:error)`, error)
            options.onError?.(error)
        }
    })
}
