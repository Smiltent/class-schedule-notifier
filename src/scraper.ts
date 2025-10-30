
import dir from "./util/dir.ts"
import axios from "axios"
import path from "path"

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
        // adds the https tag, if the url does not provide it
        if (!url.startsWith("https://") && !url.startsWith("http://")) {
            this.url = `https://${url}`
        } else {
            this.url = url
        }
    }

    public async getWeeksData() {
        try {
            const currentYear = new Date().getFullYear()
            const res = await axios.post(`${this.url}/timetable/server/ttviewer.js?__func=getTTViewerData`, {__args: [null, currentYear], __gsh: "00000000"}, {
                headers: HEADERS(this.url)
            })

            console.debug(`Successfully fetched data from ${this.url}`)
            dir.createFile(
                path.join(__dirname, "tmp", "week_data.json"), 
                JSON.stringify(res.data["r"]["regular"], null, 2)
            )

            return res.data["r"]["regular"]
        } catch (err) {
            console.error(`Failed to fetch weeks data from ${this.url}: ${err}`)
        }
    }

    public async getClassScheduleData(week: string) {
        try {
            const res = await axios.post(`${this.url}/timetable/server/regulartt.js?__func=regularttGetData`, { __args: [null, week], __gsh: "00000000" }, {
                headers: HEADERS(this.url)
            })

            dir.createFile(
                path.join(__dirname, "tmp", `${week}.json`), 
                JSON.stringify(res, null, 2)
            )

            console.debug(`Stored data into /tmp/${week}.json`)
        } catch (err) {
            console.error(`Failed to fetch data from ${this.url}: ${err}`)
        }
    }
}