
import cron from 'node-cron'

export default function cronjob() {
    // check for new week
    cron.schedule(String(process.env.NEW_WEEK_CRONJOB), function() {

    })

    // check for updates in current weeks
    cron.schedule(String(process.env.WEEK_UPDATES_CRONJOB), function() {

    })
}