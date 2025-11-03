
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
export var DEBUG_MODE: boolean = false
export var WEEKS_DATA: any

// ================= ARGUMENTS ================= 
const IS_DEBUG_ENABLED = process.argv.includes("--debug") || process.argv.includes("-d")
IS_DEBUG_ENABLED ? DEBUG_MODE = true : DEBUG_MODE = false

// ================= MAIN =================
Colors(DEBUG_MODE)
export const { hash, url } = await GitHub() 

new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL))
export const webserverClient = new Webserver(String(process.env.PORT) || "3000")

WEEKS_DATA = await scraperClient.getWeeksData()
for (const week of WEEKS_DATA["timetables"]) {
    scraperClient.storeScheduleDataToDatabase(week["tt_num"])
}