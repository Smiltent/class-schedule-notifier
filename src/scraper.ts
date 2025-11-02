
import RawScheduleData from "./db/models/RawScheduleData.ts"

import { webserverClient } from "../index.ts"
import { isEqual } from "lodash"
import axios from "axios"

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

    constructor(url: string) {
        console.debug("Running a new scraper.ts instance...")

        this.url = url

        // adds the edupage domain
        if (!this.url.includes("edupage.org")) {
            this.url = `${this.url}.edupage.org`
        }

        // adds the https tag, if the url does not provide it
        if (!this.url.startsWith("https://") && !this.url.startsWith("http://")) {
            this.url = `https://${this.url}`
        }
    }

    public async getWeeksData() {
        try {
            const currentYear = new Date().getFullYear() // might cause issues around new years...?
            const res = await axios.post(`${this.url}/timetable/server/ttviewer.js?__func=getTTViewerData`, {__args: [null, currentYear], __gsh: "00000000"}, {
                headers: HEADERS(this.url)
            })

            console.debug(`Successfully fetched Weeks data from ${this.url}`)
            return res.data["r"]["regular"]
        } catch (err) {
            console.error(`Failed to fetch weeks data from ${this.url}: ${err}`)
        }
    }

    public async storeScheduleDataToDatabase(week: string) {
        try {
            const res = await axios.post(`${this.url}/timetable/server/regulartt.js?__func=regularttGetData`, { __args: [null, week], __gsh: "00000000" }, {
                headers: HEADERS(this.url)
            })

            console.debug(`Successfully fetched Schedule data from ${this.url}`)

            const old = await RawScheduleData.findOne({ week })

            if (old && !isEqual(old.data, res.data)) {
                console.debug(`Week ${week} has been modified!`)
                webserverClient.sendWSMessage(JSON.parse(`{"week": "${week}", "type": "updated"}`))
            } else return
            
            const { upsertedCount } = await RawScheduleData.updateOne(
                { week },
                { $set: { data: res.data }},
                { upsert: true }
            )

            if (upsertedCount === 1) console.debug(`Week ${week} is brand new (never been stored)`)
        } catch (err) {
            console.error(`Failed to fetch data from ${this.url}: ${err}`)
        }
    }
}