
import { webserverClient } from "../index.ts"
import Schedule from "./schedule.ts"
import { isEqual } from "lodash"
import axios from "axios"

import RawScheduleData from "./db/models/RawScheduleData.ts"
import wait from "./util/wait.ts"

const HEADERS = (url: string) => ({
    "Referer": url,
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*"
})

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

            // this.current_week = this.weeks["timetables"][(this.weeks["timetables"].length - 1)]["tt_num"]
            this.current_week = this.weeks["default_num"] //* bro im so stupid... it's LITERALLY a variable in the response

            for (const week of this.weeks["timetables"]) {
                await this.storeWeekToDatabase(week["tt_num"])
                
                await this.parser.i(week["tt_num"])

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
            const currentYear = new Date().getFullYear() 
            const res = await axios.post(`${this.url}/timetable/server/ttviewer.js?__func=getTTViewerData`, {__args: [null, currentYear], __gsh: "00000000"}, {
                headers: HEADERS(this.url)
            })

            return res.data["r"]["regular"]
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
            
            const data = res.data["r"]

            // refreshed the weeks - yes, the message is in plural
            if (res.data["error"] === "Timetable does not exists") {
                this.weeks = await this.getWeeksData()
                return console.debug(`Week ${week} has been removed`)
            }

            // checks if its been modified
            const old = await RawScheduleData.findOne({ week });

            if (!old) {
                console.debug(`Week ${week} is brand new (never been stored)`);
                webserverClient.sendWSMessage(JSON.stringify({
                    week,
                    type: "new",
                }))
            } else {
                if (!isEqual(old.data, data.dbiAccessorRes.tables)) {
                    console.debug(`Week ${week} has been modified!`);
                    webserverClient.sendWSMessage(JSON.stringify({
                        week,
                        type: "updated",
                    }))
                }
            }

            // store into database
            console.debug(`Storing Week ${week} into Database`)
            await RawScheduleData.updateOne(
                { week },
                { $set: { data: data["dbiAccessorRes"]["tables"] }}, // dateFrom: this.weeks[week].text.split
                { upsert: true }
            )
        } catch (err) {
            console.error(`Failed to fetch data from ${this.url}: ${err}`)
        }
    }
}