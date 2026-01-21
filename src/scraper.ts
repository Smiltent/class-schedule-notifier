
import { webserverClient } from "../index.ts"
import checkDiff from "./util/diff.ts"
import Schedule from "./schedule.ts"
import axios from "axios"

import RawScheduleData from "./db/models/RawScheduleData.ts"

const HEADERS = (url: string) => ({
    "Referer": url,
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*"
})

var alreadyWarned = false

export default class Scraper {
    private url: string
    private weeks: any
    private parser: Schedule

    public current_week: string = "0"

    constructor(url: string) {
        console.debug("Running a new scraper.ts instance...")

        this.url = url
        this.parser = new Schedule()

        // adds the edupage domain
        if (!this.url.includes("edupage.org")) {
            this.url = `${this.url}.edupage.org`
        }

        // adds the https tag, if the url does not provide it
        if (!this.url.startsWith("https://") && !this.url.startsWith("http://")) {
            this.url = `https://${this.url}`
        }
    }

    public async storeAllWeeksToDatabase() {
        try {
            this.weeks = await this.getWeeksData()

            this.current_week = this.weeks.default_num

            for (const week of this.weeks.timetables) {
                const canParse = await this.storeWeekToDatabase(week.tt_num)
                if (!canParse) continue
                
                await this.parser.i(week.tt_num)

                await this.parser.storeClassData()
                await this.parser.storeTeacherData()
            }
        } catch (err) {
            console.error(`Failed to store all weeks to database: ${err}`)
        }
    }

    public async reparseAllWeeksInDatabase() {
        try {
            this.weeks = await RawScheduleData.find({})

            for (const week of this.weeks) {
                await this.parser.i(week.week)

                await this.parser.storeClassData()
                await this.parser.storeTeacherData()
            }
        } catch (err) {
            console.error(`Failed to reparse weeks in database: ${err}`)
        }
    }

    private async getWeeksData() {
        try {
            var currentYear = new Date().getFullYear()
            const yearRes = await axios.get(`${this.url}/timetable/view.php`, {
                headers: HEADERS(this.url)
            })

            // extracts the year variable from the page
            const match = yearRes.data.match(/ASC\.req_props\s*=\s*({[\s\S]*?});/)
            if (match) {
                var objString = match[1];

                objString = objString
                    .replace(/(\w+):/g, '"$1":')
                    .replace(/'/g, '"')

                currentYear = JSON.parse(objString).year_auto
            }

            console.debug(`Current year (by EduPage): ${currentYear}`)

            const dataRes = await axios.post(`${this.url}/timetable/server/ttviewer.js?__func=getTTViewerData`, {__args: [null, currentYear], __gsh: "00000000"}, {
                headers: HEADERS(this.url)
            })

            var data = dataRes.data.r.regular

            if (data.default_num == null || data.default_num === "") {
                // gets the last week available (most likely recent)
                data.default_num = data.timetables[data.timetables.length - 1].tt_num

                // gosh i love returns in try statements
                if (!alreadyWarned) { console.warn("Edupage didn't update their year or default_num is empty...") }
                alreadyWarned = true
            }

            return data
        } catch (err) {
            console.error(`Failed to fetch weeks data from ${this.url}: ${err}`)
            return null
        }
    }

    private async storeWeekToDatabase(week: string) {
        try {
            const res = await axios.post(`${this.url}/timetable/server/regulartt.js?__func=regularttGetData`, { __args: [null, week], __gsh: "00000000" }, {
                headers: HEADERS(this.url)
            })
            
            const data = res.data.r

            // refreshed the weeks - yes, the message is in plural
            if (res.data.error === "Timetable does not exists") {
                this.weeks = await this.getWeeksData()
                return console.debug(`Week ${week} has been removed`)
            }

            // checks if its been modified
            const old = await RawScheduleData.findOne({ week });

            var shouldUpdate = false
            if (!old) {
                console.debug(`Week ${week} is brand new (never been stored)`)

                webserverClient.sendWSMessage(JSON.stringify({
                    week,
                    type: "new",
                }))

                shouldUpdate = true
            } else {
                const changes = checkDiff(old?.data, data.dbiAccessorRes.tables)
                if (changes !== "no changes") {
                    console.debug(`Week ${week} has been modified!`)  
                    shouldUpdate = true
                }
            }

            if (!shouldUpdate) return false

            // store into database
            console.debug(`Storing Raw Week ${week} into Database`)
            await RawScheduleData.updateOne(
                { week },
                { $set: { 
                    data: data.dbiAccessorRes.tables
                }},
                { upsert: true }
            )

            return true
        } catch (err) {
            console.error(`Failed to fetch data from ${this.url}: ${err}`)
            return false
        }
    }
}