
import chalk from "chalk"

const GRAY = chalk.hex("#232634")
const RED = chalk.hex("#d20f39")
const BLUE = chalk.hex("#1e66f5")
const ORANGE = chalk.hex("#fe640b")
const YELLOW = chalk.hex("#df8e1d")

function getTime() {
    const date = new Date()
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

    return `[${day}.${month}] ${hours}:${minutes}:${seconds}:${milliseconds}`
}

export default function colors(debugModeEnabled: boolean) {
    console.log = (...args) => process.stdout.write(`${GRAY(getTime())} ${args}\n`)

    console.warn = (...args) => console.log(`${YELLOW("[WARN]")} ${args}`)
    console.error = (...args) => console.log(`${RED("[ERROR]")} ${args}`)
    console.info = (...args) => console.log(`${BLUE("[INFO]")} ${args}`)
    
    debugModeEnabled ? console.debug = (...args) => console.log(`${ORANGE("[DEBUG]")} ${args}`) : console.debug = () => {}
    console.debug("Debug mode is enabled")
}
