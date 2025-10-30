
// ================= IMPORTS =================
import colors from "./src/util/colors.ts"
import Schedule from "./src/schedule.ts"
import Scraper from "./src/scraper.ts"
import Express from "./src/express.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= VARIABLES =================
const SCRAPE_URL: string = process.env.WEBSITE_URL as string || "school.com"
var WEEKS_DATA

// ================= MAIN =================
colors()

try {
    const scraperClient = new Scraper(SCRAPE_URL)

    WEEKS_DATA = await scraperClient.getWeeksData()
    for (const week of WEEKS_DATA["timetables"]) {
        console.debug(`Saving week ${week["tt_num"]}`)


    }

    // new Express(String(process.env.PORT) || "3000")
    new Schedule(`./src/tmp/${WEEKS_DATA["default_num"]}.json`)
} catch (err) {
    console.error(`Error in main file: ${err}`)
}
