
import { execSync } from 'child_process'

export default async function getGitInfo() {
    try {
        const hash = execSync(`git rev-parse HEAD`).toString().trim()

        return {
            hash: hash.substring(0, 14),
            url: `https://github.com/Smiltent/class-schedule-notifier/commit/${hash}`
        }
    } catch (err) {
        console.error(`Error fetching git hash from .git folder (git might not be installed): ${err}`)
        return {
            hash: "unknown",
            url: "#"
        }
    }
}