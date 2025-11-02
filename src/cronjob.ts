
import { WEEKS_DATA } from '..'
import cron from 'node-cron'
import RawScheduleData from './db/models/RawScheduleData'

export default function cronjob() {
    // check for new week
    cron.schedule(String(process.env.NEW_WEEK_CRONJOB), () => {
        console.debug("Running Cronjob for new week updates...")

    
    })

    // check for updates in current weeks
    cron.schedule(String(process.env.WEEK_UPDATES_CRONJOB), () => {
        console.debug("Running Cronjob for period week updates...")
        try {   

            for (const week of WEEKS_DATA["timetables"]) {
                
            }
        } catch (err) {
            console.error(`Error in period week updates Cronjob: ${err}`)
        }
    })
}