
/**
 * Generic wait function
 * @param ms Milliseconds to wait
 * @returns a promise to shut up the async thread
 */

export default function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}