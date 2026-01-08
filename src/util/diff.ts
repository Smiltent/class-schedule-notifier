
import { diffLines, type Change } from "diff"

/**
 * Checks the difference between two strings.
 * @param oldd Old string.
 * @param neww New string.
 * @returns Difference between both strings, if there are - returned in a code block format.
 */
export default function checkDiff(oldd: unknown, neww: unknown): string {
    const diff = diffLines(
        JSON.stringify(oldd, null, 2), 
        JSON.stringify(neww, null, 2)
    )

    const extracted = extractChanges(diff, 3)

    if (extracted.trim()) {
        console.log('```diff\n' + extracted + '\n```')
        return '```diff\n' + extracted + '\n```'
    } else {
        return "no changes"
    }
}

/**
 * Helper function to only get differences and not the whole data.
 */
function extractChanges(changes: Change[], context: number = 0) {
    const lines = []

    for (var i = 0; i < changes.length; i++) {
        const part = changes[i]

        if (!part?.added && !part?.removed) continue
        if (typeof part.value !== "string") continue

        if (context > 0 && i > 0) {
            const prev = changes[i - 1]

            if (prev && !prev.added && !prev.removed && typeof prev.value === "string") {
                const ctxLine = prev.value.split(/\r?\n/).slice(-context)
                ctxLine.forEach(l => l.trim() && lines.push("  " + l))
            }
        }

        const prefix = part.added ? "+" : "-"
        for (const line of part.value.split(/\r?\n/)) {
            if (line.trim()) {
                lines.push(`${prefix} ${line}`)
            }
        }

        if (context > 0 && i < changes.length - 1) {
            const next = changes[i + 1]
            
            if (next && !next.added && !next.removed && typeof next.value === "string") {
                const ctxLine = next.value.split(/\r?\n/).slice(0, context)
                ctxLine.forEach(l => l.trim() && lines.push("  " + l))
            }
        }
    }

    return [... new Set(lines)].join('\n')
}
