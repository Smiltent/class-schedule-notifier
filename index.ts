
// ================= IMPORTS =================
import Database from "./src/db/database.ts"
import Webserver from "./src/webserver.ts"
import Colors from "./src/util/colors.ts"
import GitHub from "./src/util/github.ts"
import Schedule from "./src/schedule.ts"
import Scraper from "./src/scraper.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= VARIABLES =================
export const { hash, url } = await GitHub()
var DEBUG_MODE: boolean = false

// ================= ARGUMENTS ================= 
const IS_DEBUG_ENABLED = process.argv.includes("--debug") || process.argv.includes("-d")
IS_DEBUG_ENABLED ? DEBUG_MODE = true : DEBUG_MODE = false

// ================= FUNCTIONS =================
export function getDebugMode(): boolean {
    return DEBUG_MODE
}

// ================= MAIN =================
Colors(DEBUG_MODE)

new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL))
export const webserverClient = new Webserver(String(process.env.PORT) || "3000")

await scraperClient.storeAllWeeksToDatabase()

setInterval(async () => {
    await scraperClient.storeAllWeeksToDatabase()
}, 15 * 60 * 1000) // 15 min