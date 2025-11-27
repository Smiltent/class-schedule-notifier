

// ================= IMPORTS =================
import Database from "./src/db/database.ts"
import Colors from "./src/util/colors.ts"
import Schedule from "./src/schedule.ts"

import dotenv from "dotenv"
dotenv.config()

// ================= MAIN =================
Colors(true)

new Database(String(process.env.CONNECTION_STRING))

const scheduleClient = new Schedule("61")
await scheduleClient.storeClassIntoDatabase()




// switch (process.env.MODE) {
//     case "scraper": case "SCRAPER":
//         console.debug("Running in SCRAPER mode")
//         await scheduleClient.runScraperLoop(Number(process.env.SCRAPER_INTERVAL) || 60000)
//         break
//     default:
//         console.debug("No valid MODE provided, exiting...")
//         process.exit(0)
// }