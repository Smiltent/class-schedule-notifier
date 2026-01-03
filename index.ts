
// ================= IMPORTS =================
import Database from "./src/db/database.ts"
import Webserver from "./src/webserver.ts"
import GitHub from "./src/util/github.ts"
import Scraper from "./src/scraper.ts"

import colors from "./src/util/colors.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= VARIABLES =================
export const { hash, url } = await GitHub()
var DEBUG_MODE: boolean = false

// ================= ARGUMENTS ================= 
const argDEBUG = process.argv.includes("--debug") || process.argv.includes("-d")
argDEBUG ? DEBUG_MODE = true : DEBUG_MODE = false
colors(DEBUG_MODE)

const argPARSE_ALL_DATA = process.argv.includes("--parse-all-data") || process.argv.includes("-p")
if (argPARSE_ALL_DATA) {
    console.info("Forcing re-parse of all data in database...")

    new Database(String(process.env.CONNECTION_STRING))
    const scraperClient = new Scraper(String(process.env.WEBSITE_URL))

    await scraperClient.reparseAllWeeksInDatabase()

    console.info("Re-parse of all data in database complete! exiting...")
    process.exit(0)
}

// ================= MAIN =================
new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL))
export const webserverClient = new Webserver(String(process.env.PORT) || "3000")

await scraperClient.storeAllWeeksToDatabase()
console.debug(`Current week: ${scraperClient.current_week}`)

setInterval(async () => {    
    await scraperClient.storeAllWeeksToDatabase()
}, 15 * 60 * 1000) // 15 min
