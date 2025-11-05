
import { webserverClient, setWeeksData } from "../index.ts"
import { isEqual } from "lodash"
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
            
            const data = res.data["r"]["dbiAccessorRes"]["tables"]

            console.debug(`Successfully fetched Week ${week} data from ${this.url}`)

            // yes, the message is in plural
            if (res.data["r"]["error"] === "Timetable does not exists") {
                console.debug(`Week ${week} has been removed`)
                setWeeksData(await this.getWeeksData())
                return
            }

            // checks if its been modified | TODO: make it notify what changes have been made and store them
            const old = await RawScheduleData.findOne({ week })
            if (old && !isEqual(old.data, data)) {
                console.debug(`Week ${week} has been modified!`)
                webserverClient.sendWSMessage(JSON.parse(`{"week": "${week}", "type": "updated"}`))
            } else if (!old) {
                console.debug(`Week ${week} is brand new (never been stored)`)
                webserverClient.sendWSMessage(JSON.parse(`{"week": "${week}", "type": "new"}`))
            } else return
            
            // store into database
            console.debug(`Storing Week ${week} into Database`)
            await RawScheduleData.updateOne(
                { week },
                { $set: { data }},
                { upsert: true }
            )
        } catch (err) {
            console.error(`Failed to fetch data from ${this.url}: ${err}`)
        }
    }
}