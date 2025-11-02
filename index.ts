
// ================= IMPORTS =================
import RawScheduleData from "./src/db/models/RawScheduleData.ts"

import Database from "./src/db/database.ts"
import Webserver from "./src/webserver.ts"
import colors from "./src/util/colors.ts"
import Schedule from "./src/schedule.ts"
import Cronjob from "./src/cronjob.ts"
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
colors(DEBUG_MODE)

new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL) || "school.com")
export const WebserverClient = new Webserver(String(process.env.PORT) || "3000")

WEEKS_DATA = await scraperClient.getWeeksData()
for (const week of WEEKS_DATA["timetables"]) {
    scraperClient.storeScheduleDataToDatabase(week["tt_num"])
}


try {

    

    // WEEKS_DATA = await scraperClient.getWeeksData()
    // for (const week of WEEKS_DATA["timetables"]) {
    //     console.debug(`Saving week ${week["tt_num"]}`)
    // }

    // new Schedule(`./src/tmp/${WEEKS_DATA["default_num"]}.json`)

    // databaseClient.storeRawWeekData(
    //     WEEKS_DATA["default_num"],
        
    // )


    
} catch (err) {
    console.error(`Error in main file: ${err}`)
}
