
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
var WEEKS_DATA: any = {}

// ================= ARGUMENTS ================= 
const IS_DEBUG_ENABLED = process.argv.includes("--debug") || process.argv.includes("-d")
IS_DEBUG_ENABLED ? DEBUG_MODE = true : DEBUG_MODE = false

// ================= FUNCTIONS =================
export function getDebugMode(): boolean {
    return DEBUG_MODE
}

export function getWeeksData(): any {
    return WEEKS_DATA
}

export function setWeeksData(data: any) {
    WEEKS_DATA = data
}

// ================= MAIN =================
Colors(DEBUG_MODE)

new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL))
export const webserverClient = new Webserver(String(process.env.PORT) || "3000")

async function obtainWeeksData() {
    WEEKS_DATA = await scraperClient.getWeeksData()
}

async function storeRawWeeksData() {
    for (const week of WEEKS_DATA["timetables"]) {
        await scraperClient.storeScheduleDataToDatabase(week["tt_num"])
    }
}

await obtainWeeksData()
await storeRawWeeksData()

setInterval(async () => {
    await obtainWeeksData()
    await storeRawWeeksData()
}, 15 * 60 * 1000) // 15 min