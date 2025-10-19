
// ================= IMPORTS =================
import colors from "./src/util/colors.ts"
import Schedule from "./src/schedule.ts"
import Scraper from "./src/scraper.ts"
import Express from "./src/express.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= VARIABLES =================
const url: string = process.env.WEBSITE_URL as string || "school.com"

// ================= MAIN =================
colors()

try {
    await new Scraper(url).getClassScheduleData()

    new Express(String(process.env.PORT) || "3000")
    new Schedule("./src/tmp/d.json")

} catch (err) {
    console.error(`Error in main file: ${err}`)
}
