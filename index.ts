
// ================= IMPORTS =================
import Database from "./src/MongoDB.ts"
import Express from "./src/Express.ts"
import Scraper from "./src/Scraper.ts"

import logging from "./util/log.ts"
require("dotenv").config()

// ================= VARIABLES =================
var DEBUG_MODE: boolean = false

// ================= ARGUMENTS ================= 
const argDEBUG = process.argv.includes("--debug") || process.argv.includes("-d")
argDEBUG ? DEBUG_MODE = true : DEBUG_MODE = false
logging(DEBUG_MODE)

// ================= MAIN =================
new Database(String(process.env.CONNECTION_STRING))
export const scraper = new Scraper(String(process.env.WEBSITE_URL))
export const express = new Express(String(process.env.PORT) || "3000")

scraper.reparseAllWeeksInDatabase()