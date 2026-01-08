
import { diffString } from 'json-diff'

/**
 * Checks the difference between two strings.
 * @param oldd Old string.
 * @param neww New string.
 * @returns Difference between both strings, if there are - returned in a code block format.
 */
export default function checkDiff(oldd: string, neww: string): string {
    const diff = diffString(
        JSON.parse(oldd), 
        JSON.parse(neww)
    )

    if (diff.trim()) {
        return '```diff\n' + diff + '\n```'
    } else {
        return "no changes"
    }
}
