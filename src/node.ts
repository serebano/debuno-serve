import { type Server, createServer } from 'node:http'
import type { ServeOptions } from "./types.ts";
import { toLocalhost } from "./utils.ts";
import { createServerAdapter } from 'https://esm.sh/@whatwg-node/server'
export const ENV = "node" as const

export function serve(options: ServeOptions): Server {

    const nodeRequestHandler = createServerAdapter(options.fetch)
    const server = createServer(nodeRequestHandler)

    server.on('error', (err) => options.onError?.(err))
    server.on('listening', () => {
        const { port, address: hostname } = server.address() as { port: number, address: string }

        options.onListen?.({
            port,
            hostname,
            url: new URL(`http://${toLocalhost(hostname)}:${port}`)
        })
    })

    return server.listen(options.port, options.hostname)
}


export async function readFile(filePath: string): Promise<ReadableStream> {
    try {
        const fs = await import('node:fs')
        const { Readable } = await import('node:stream')

        filePath = filePath.replace('file://', '')

        if (!fs.existsSync(filePath))
            throw new Error(`File not found: ${filePath}`)

        return Readable.toWeb(fs.createReadStream(filePath, {
            autoClose: true,
        })) as unknown as ReadableStream

    } catch (error: any) {
        throw error
    }
}

export async function writeFile(filePath: string, data: any): Promise<void> {
    const fs = await import('node:fs/promises')

    return fs.writeFile(filePath.replace('file://', ''), data)
}

export async function readDir(dirPath: string): Promise<string[]> {
    const fs = await import('node:fs/promises');
    dirPath = dirPath.replace('file://', '');
    dirPath = await import('node:path').then((m) => m.resolve(dirPath))

    const entries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true });

    return entries
        .filter(entry => entry.isFile())
        .map(entry => (entry.parentPath.endsWith('/') ? entry.parentPath : entry.parentPath + "/") + entry.name)
        .map(filePath => filePath.replace(dirPath, ''))
        .map(filePath => filePath.startsWith('/') ? filePath.slice(1) : filePath) //.replace(dirPath.endsWith('/') ? dirPath : dirPath + '/', ''))
}