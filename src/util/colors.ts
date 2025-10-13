
import chalk from "chalk"

const GRAY = chalk.hex("#4c4f69")
const RED = chalk.hex("#d20f39")
const BLUE = chalk.hex("#1e66f5")
const ORANGE = chalk.hex("#fe640b")
const YELLOW = chalk.hex("#df8e1d")

function getTime() {
    const date = new Date()
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}`
}

export default function colors() {
    console.log = (...args) => process.stdout.write(`${GRAY(getTime())} ${args}\n`)

    console.warn = (...args) => console.log(`${YELLOW("[WARN]")} ${args}`)
    console.debug = (...args) => console.log(`${ORANGE("[DEBUG]")} ${args}`)
    console.error = (...args) => console.log(`${RED("[ERR]")} ${args}`)
    console.info = (...args) => console.log(BLUE(`[INFO] ${args}`))
}
