
// ================= IMPORTS =================
import Database from "./src/MongoDB.ts"
import Webserver from "./src/Express.ts"
import Scraper from "./src/Scraper.ts"

import logging from "./src/util/logging.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= VARIABLES =================
var DEBUG_MODE: boolean = false

// ================= ARGUMENTS ================= 
const argDEBUG = process.argv.includes("--debug") || process.argv.includes("-d")
argDEBUG ? DEBUG_MODE = true : DEBUG_MODE = false
logging(DEBUG_MODE)

// ================= MAIN =================
new Database(String(process.env.CONNECTION_STRING))

export const scraperClient = new Scraper(String(process.env.WEBSITE_URL))
export const webserverClient = new Webserver(String(process.env.PORT) || "3000")

await scraperClient.storeAllWeeksToDatabase()
console.debug(`Current week: ${scraperClient.currentWeek}`)

setInterval(async () => {    
    await scraperClient.storeAllWeeksToDatabase()
}, 5 * 60 * 1000) // 5 min