

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
