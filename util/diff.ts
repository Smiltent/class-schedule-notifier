
import { diffLines, type Change } from "diff"

export function checkScheduleChanges(oldData: any, newData: any) {
    const result: Record<string, { old: any, new: any}> = {}

    const oldDays = oldData;
    const newDays = newData;

    const allDayKeys = new Set([...Object.keys(oldDays), ...Object.keys(newDays)])

    for (const day of allDayKeys) {
        const oldDay = oldDays[day]
        const newDay = newDays[day]

        if (!oldDay || !newDay) {
            result[day] = { new: newDay, old: oldDay }
            continue
        }

        var lessonsChanged = false

        for (var i = 0; i < Math.max(oldDay.lessons.length, newDay.lessons.length); i++) {
            const oldLesson = oldDay.data[i]
            const newLesson = newDay.data[i]

            if (
                oldLesson.name !== newLesson.name ||
                oldLesson.teacher !== newLesson.teacher ||
                oldLesson.room !== newLesson.room
            ) {
                lessonsChanged = true
                break
            }
        }

        if (lessonsChanged) {
            result[day] = {
                new: newDay,
                old: oldDay
            }
        }
    }

    return { data: result }
}

/**
 * Checks the difference between two strings.
 * @param oldd Old string.
 * @param neww New string.
 * @returns Difference between both strings, if there are - returned
 * @deprecated function sucks ass
 */
export default function checkDiff(oldd: unknown, neww: unknown): string {
    const diff = diffLines(
        JSON.stringify(oldd, null, 2), 
        JSON.stringify(neww, null, 2)
    )

    const extracted = extractChanges(diff, 3)

    if (extracted.trim()) {
        return extracted 
    } else {
        return "no changes"
    }
}

/**
 * Helper function to only get differences and not the whole data. Uses Git Hunk formatting.
 * @deprecated function sucks ass
 */
function extractChanges(changes: Change[], context: number = 0) {
    const lines = []

    var oldLine = 5
    var newLine = 5

    for (var i = 0; i < changes.length; i++) {
        const part = changes[i]

        if (!part?.added && !part?.removed) continue
        if (typeof part.value !== "string") continue

        if (!part.added && !part.removed) {
            oldLine += countLines(part.value)
            newLine += countLines(part.value)

            continue
        }

        const hLines: string[] = []

        var oldStart = oldLine
        var newStart = newLine

        var oldCount = 0
        var newCount = 0

        if (context > 0 && i > 0) {
            const prev = changes[i - 1]

            if (prev && !prev.added && !prev.removed && typeof prev.value === "string") {
                const ctxLine = prev.value.split(/\r?\n/).slice(-context)
                // ctxLine.forEach(l => l.trim() && lines.push("  " + l))

                ctxLine.forEach(l => {
                    if (l.trim()) {
                        hLines.push(` ${l}`)

                        oldCount++
                        newCount++
                    }
                })

                oldStart -= oldCount
                newStart -= newCount
            }
        }

        // const prefix = part.added ? "+" : "-"
        // for (const line of part.value.split(/\r?\n/)) {
        //     if (line.trim()) {
        //         lines.push(`${prefix} ${line}`)
        //     }
        // }

        while (i < changes.length) {
            const curr = changes[i]
            if (!curr || typeof curr.value !== "string") break

            if (curr.added) {
                curr.value.split(/\r?\n/).forEach(l => {
                    if (l.trim()) {
                        hLines.push(`+${l}`)
                        newCount++
                    }
                })
            } else if (curr.removed) {
                curr.value.split(/\r?\n/).forEach(l => {
                    if (l.trim()) {
                        hLines.push(`-${l}`)
                        oldCount++
                    }
                })
            } else break

            i++
        }

        i--

        if (context > 0 && i < changes.length - 1) {
            const next = changes[i + 1]
            
            if (next && !next.added && !next.removed && typeof next.value === "string") {
                const ctxLine = next.value.split(/\r?\n/).slice(0, context)
                // ctxLine.forEach(l => l.trim() && lines.push("  " + l))

                ctxLine.forEach(l => {
                    if (l.trim()) {
                        hLines.push(` ${l}`)

                        oldCount++
                        newCount++
                    }
                })
            }
        }

        lines.push(
            `%m@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`
        )

        lines.push(...hLines)

        oldLine += oldCount
        newLine += newCount
    }

    return [... new Set(lines)].join('\n')
}

function countLines(str: string) {
    return str.split(/\r?\n/).filter(Boolean).length
}