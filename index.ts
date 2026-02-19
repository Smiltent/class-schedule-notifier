
// ================= IMPORTS =================
import Database from "./src/MongoDB.ts"
import Webserver from "./src/Express.ts"
// import Scraper from "./src/scraper.ts"

import logging from "./src/util/logging.ts"

import dotenv from "dotenv"
import Schedule from "./src/Schedule.ts"
import Scraper from "./src/Scraper.ts"
dotenv.config()

// ================= VARIABLES =================
var DEBUG_MODE: boolean = false

// ================= ARGUMENTS ================= 
const argDEBUG = process.argv.includes("--debug") || process.argv.includes("-d")
argDEBUG ? DEBUG_MODE = true : DEBUG_MODE = false
logging(DEBUG_MODE)

// const argPARSE_ALL_DATA = process.argv.includes("--parse-all-data") || process.argv.includes("-p")
// if (argPARSE_ALL_DATA) {
//     console.info("Forcing re-parse of all data in database...")

//     new Database(String(process.env.CONNECTION_STRING))
//     const scraperClient = new Scraper(String(process.env.WEBSITE_URL))

//     await scraperClient.reparseAllWeeksInDatabase()

//     console.info("Re-parse of all data in database complete! exiting...")
//     process.exit(0)
// }

// ================= MAIN =================
new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL))
export const webserverClient = new Webserver(String(process.env.PORT) || "3000")


// await scraperClient.storeAllWeeksToDatabase()
// console.debug(`Current week: ${scraperClient.current_week}`)

// setInterval(async () => {    
//     await scraperClient.storeAllWeeksToDatabase()
// }, 5 * 60 * 1000) // 5 min

const dev = new Schedule()
dev.i("76")
dev.storeLessonData()

const scrape = new Scraper(String(process.env.WEBSITE_URL))
console.log(
    JSON.stringify(
        await scrape.getWeeksData()
    )
)