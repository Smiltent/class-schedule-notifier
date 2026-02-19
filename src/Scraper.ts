
import checkDiff from "./util/diff.ts"
import Schedule from "./Schedule.ts"
import axios from "axios"

import RawScheduleData from "./db/RawScheduleData.ts"
import Week from "./db/Week.ts"

const createHeaders = (url: string) => ({
    "Referer": url,
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*"
})

var alreadyWarned = false
var displayedYear = false

export default class Scraper {
    private url: string
    private weeks: any
    private parser: Schedule

    public currentWeek: string = "0"
    public currentYear: string = "0000"

    constructor(url: string) {
        console.debug("Running a new Scraper.ts instance...")

        this.url = this.normalizeUrl(url)
        this.parser = new Schedule()
    }

    /**
     * Fetches all the weeks from EduPage and stores them into the database
     */
    public async storeAllWeeksToDatabase() {
        try {
            this.currentYear = await this.fetchYear()
            this.weeks = await this.getWeeksData()

            this.currentWeek = this.weeks.default_num

            for (const week of this.weeks.timetables) {
                // TODO: there could be a chance, where the storing is too slow, and it doesn't finish before it can start parsing
                await Week.updateOne(
                    { id: week.tt_num },
                    { $set: { id: week.tt_num, year: week.year, dateFrom: week.datefrom } },
                    { upsert: true }
                )

                const canParse = await this.storeWeekToDatabase(week.tt_num)
                if (!canParse) continue
                
                await this.parser.i(week.tt_num)
                await this.parser.storeLessonData()
            }
        } catch (err) {
            console.error(`Failed to store all weeks to database: ${err}`)
        }
    }

    /**
     * Reparses every single stored week in the Database
     * Useful for when schema has changed
     */
    public async reparseAllWeeksInDatabase() {
        try {
            this.weeks = await RawScheduleData.find({})

            for (const week of this.weeks) {
                await this.parser.i(week.week)
                await this.parser.storeLessonData()
            }
        } catch (err) {
            console.error(`Failed to reparse weeks in database: ${err}`)
        }
    }

    /**
     * Obtain the weeks data from EduPage
     * @returns Weeks Data
     */
    public async getWeeksData() {
        try {
            const { data: res } = await axios.post(
                `${this.url}/timetable/server/ttviewer.js?__func=getTTViewerData`, 
                { __args: [ null, this.currentYear ], __gsh: "00000000" }, 
                { headers: createHeaders(this.url) }
            )

            var data = res.r.regular

            // edge case - in case if it's empty or null
            if (!data.default_num) {
                data.default_num = data.timetables.at(-1).tt_num

                if (!alreadyWarned) {
                    console.warn("Default_num is empty, falling back to most recent week...")
                    alreadyWarned = true
                }
            }

            return data
        } catch (err) {
            console.error(`Failed to fetch weeks data from ${this.url}: ${err}`)
            return null
        }
    }

    /**
     * Store the week into the database
     * @param week EduPage week
     * @returns successfullness
     */
    private async storeWeekToDatabase(week: string) {
        try {
            const { data: res } = await axios.post(
                `${this.url}/timetable/server/regulartt.js?__func=regularttGetData`, 
                { __args: [null, week], __gsh: "00000000" },
                { headers: createHeaders(this.url) }
            )
            
            // refreshed the weeks - yes, the message is in plural
            if (res.error === "Timetable does not exists") {
                this.weeks = await this.getWeeksData()
                console.debug(`Week ${week} has been removed`)

                return false
            }

            const incoming = res.r.dbiAccessorRes.tables
            const existing = await RawScheduleData.findOne({ week })

            const isNew = !existing
            const isModified = existing && checkDiff(existing.data, incoming) !== "no changes"

            if (!isNew && !isModified) return false
            console.debug(`${isNew ? "New" : "Modified"} week ${week} — storing to database.`)

            await RawScheduleData.updateOne(
                { week },
                { $set: { data: incoming } },
                { upsert: true }
            )

            return true
        } catch (err) {
            console.error(`Failed to fetch week ${week} from ${this.url}: ${err}`)
            return false
        }
    }

    /**
     * Obtains the year variable from EduPage. Why don't they just get the current year?
     * @returns the current school year from EduPage
     */
    private async fetchYear() {
        var year = new Date().getFullYear()
        const yearRes = await axios.get(`${this.url}/timetable/view.php`, {
            headers: createHeaders(this.url)
        })

        // extracts the year variable from the page
        const match = yearRes.data.match(/ASC\.req_props\s*=\s*({[\s\S]*?});/)
        if (match) {
            var objString = match[1];

            objString = objString
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"')

            year = JSON.parse(objString).year_auto
        }

        !displayedYear ? console.info(`Current School Year: ${year}`) : null
        displayedYear = true

        return String(year)
    }

    /**
     * Edge-case handling URL normalization, in case user forgets to add protocol or the domain
     * @param url uncomplete EduPage URL
     * @returns complete EduPage URL
     */
    private normalizeUrl(url: string) {
        if (!url.includes("edupage.org")) url = `${url}.edupage.org`
        if (!url.startsWith("https://") && !url.startsWith("http://")) url = `https://${url}`

        return url
    }
}