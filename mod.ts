import type { ENV, Servers, ServeModule, ServeOptions } from "./src/types.ts";
import process from "node:process";

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
export type Server = Servers[ENV]

export const readDir: Serve['readDir'] = (...args) => import(`./src/${Env}.ts`).then(mod => mod.readDir(...args))
export const readFile: Serve['readFile'] = (...args) => import(`./src/${Env}.ts`).then(mod => mod.readFile(...args))
export const writeFile: Serve['writeFile'] = (...args) => import(`./src/${Env}.ts`).then(mod => mod.writeFile(...args))

export async function serve<T extends ENV>(options: ServeOptions): Promise<Servers[T] & { close: (reason?: any) => void }> {
    const start = performance.now()
    const serveModule = await import(`./src/${Env}.ts`) as ServeModule<Servers[T]>

    const controller = new AbortController()
    options.signal = controller.signal
    const close = (reason?: any) => controller.abort(reason)

    const server = await serveModule.serve({
        ...options,
        onListen: async (addr) => {
            if (options.debug)
                console.log(`[serve][on:listen] (${navigator.userAgent}) ${addr.url}`, performance.now() - start, 'ms')
            await options.onListen?.(addr)
        },
        onError: async (error: any) => {
            if (options.debug)
                console.error(`[serve][on:error] (${navigator.userAgent}) error`, error.message)
            await options.onError?.(error)
        },
        onClose: async (error?: any) => {
            if (options.debug)
                console.log(`[serve][on:close] (${navigator.userAgent}) closed`, performance.now() - start, 'ms')
            await options.onClose?.(error)
        }
    })

    // options.signal.addEventListener('abort', async (e) => {
    //     console.log(`[serve][on:abort] (${navigator.userAgent}) abort`, e.type)
    //     await options.onClose?.(e)
    // })

    process.on('SIGINT', async () => {
        console.log()
        console.group("[server] shutting down...")
        console.log()
        try {
            await options?.onClose?.()
            controller.abort('SIGINT')
            console.groupEnd()
            console.log()
            console.log(`[server] closed [SIGINT]`)
        } catch (e: any) {
            console.groupEnd()
            console.log()
            console.log(`[server] ${e.message}`)
        } finally {
            process.exit(0)
        }
    })


    return Object.assign(server, {
        close
    })
}


