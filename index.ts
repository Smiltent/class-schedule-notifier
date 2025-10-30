
// ================= IMPORTS =================
import colors from "./src/util/colors.ts"
import Database from "./src/database.ts"
import Schedule from "./src/schedule.ts"
import Scraper from "./src/scraper.ts"
import Express from "./src/express.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= VARIABLES =================
const SCRAPE_URL: string = process.env.WEBSITE_URL as string || "school.com"
var DEBUG_MODE: boolean = false
var WEEKS_DATA = null

// ================= ARGUMENTS ================= 
const IS_DEBUG_ENABLED = process.argv.includes("--debug") || process.argv.includes("-d")
IS_DEBUG_ENABLED ? DEBUG_MODE = true : DEBUG_MODE = false

// ================= MAIN =================
colors(DEBUG_MODE)

try {
    const scraperClient = new Scraper(SCRAPE_URL)

    WEEKS_DATA = await scraperClient.getWeeksData()
    for (const week of WEEKS_DATA["timetables"]) {
        console.debug(`Saving week ${week["tt_num"]}`)
    }

    new Express(String(process.env.PORT) || "3000")
    const databaseClient = new Database(String(process.env.CONNECTION_STRING))
    // new Schedule(`./src/tmp/${WEEKS_DATA["default_num"]}.json`)

    databaseClient.storeRawWeekData(
        WEEKS_DATA["default_num"],
        
    )
} catch (err) {
    console.error(`Error in main file: ${err}`)
}
