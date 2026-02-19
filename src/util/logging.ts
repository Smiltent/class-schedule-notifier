
import chalk from "chalk"
import path from "path"

const YELLOW = chalk.hex("#dfbc1dff")
const ORANGE = chalk.hex("#fe640b")
const BLUE = chalk.hex("#1e66f5")
const GRAY = chalk.hex("#232634")
const RED = chalk.hex("#d20f39")

/**
 * Get the current time in a specific format
 * @returns Current time in HH:MM:SS:MS format
 */
function getTime() {
    const date = new Date()

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

    return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

/**
 * Extract the caller file from the stack trace
 */
function getCaller() {
    const stack = new Error().stack
    if (!stack) return "unknown"

    const lines = stack.split("\n")

    const callerLine = lines[3]
    if (!callerLine) return "unknown"

    const match =
        callerLine.match(/\((.*):(\d+):(\d+)\)/) ||
        callerLine.match(/at (.*):(\d+):(\d+)/)

    if (!match) return "unknown"

    const filePath = match[1] ?? "?"
    const line = match[2]

    return `${path.basename(filePath)}:${line}`
}

export default function logging(debugModeEnabled: boolean) {
    const base = (...args: any[]) => {
        const caller = getCaller()

        process.stdout.write(
            `${GRAY(`[${caller}]`)} ${GRAY(getTime())} ${args}\n`
        )
    }

    console.log = (...args) => base(...args)

    console.warn = (...args) => base(`${YELLOW("[WARN]")} ${args}`)
    console.error = (...args) => base(`${RED("[ERROR]")} ${args}`)
    console.info = (...args) => base(`${BLUE("[INFO]")} ${args}`)

    debugModeEnabled ? console.debug = (...args) => base(`${ORANGE("[DEBUG]")} ${args}`) : console.debug = () => {}
    console.debug("Debug mode is enabled")
}
