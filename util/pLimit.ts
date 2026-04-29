
export function pLimit(con: number) {
    const queue: (() => void)[] = []
    let active = 0

    const next = () => {
        if (active >= con || queue.length == 0) return

        active++
        queue.shift()!()
    }

    return <T>(fn: () => Promise<T>): Promise<T> => 
        new Promise((resolve, reject) => {
            queue.push(() => fn().then(resolve).catch(reject).finally(() => { active--; next() }))
            next()
        })
}