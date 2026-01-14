
import RawScheduleData from "./db/models/RawScheduleData.ts"
import TeacherWeekData from "./db/models/TeacherWeekData.ts"
import ClassWeekData from "./db/models/ClassWeekData.ts"

import sendWebhook from "./util/webhook.ts"
import checkDiff from "./util/diff.ts"
import { webserverClient } from "../index.ts"

export default class Schedule {
    private week!: string

    private data: any
    private index: any

    private ignoreFutureWarnings: string[] = []

    /**
     * Initializes the Schedule parser for a specific week
     * @param week The week to parse from Edupage
     */
    public async i(week: string) {
        await this.loadIndex(this.week = week)
    }

    /**
     * Stores the parsed class into the Database
     */
    public async storeClassData() {
        if (!this.index) await this.loadIndex(this.week)

        const endData: Record<string, any> = {}
        
        for (const card of this.index.cards) {
            // get lesson information
            const lesson = this.index.lessons[card.lessonid]

            // period division, much more easier to work with
            var period = Math.ceil(card.period / 2) 

            // index information
            const classroom = this.index.classrooms[card.classroomids[0]]
            const teacher = this.index.teachers[lesson.teacherids[0]] 
            const subject = this.index.subjects[lesson.subjectid]
            // const clazz = this.index.classes[lesson.classids[0]] // TODO: There could be multiple classes...

            // if (lesson.classids.length >= 2) return console.log(lesson.classids)
            const classes = lesson.classids.map((id: string) => this.index.classes[id])

            // get day info
            const dayInfo = await this.getDayById(card.days)
            if (!dayInfo) continue

            const { day, name, shortName, isLastDayOfWeek } = dayInfo
            const duration = Math.ceil(lesson.durationperiods / 2)

            for (const clazz of classes) {
                // ensures day object exists
                this.ensureDay(endData, clazz.name, day, name, shortName)

                // store each period
                for (var i = 0; i < duration; i++, period++) {
                    const times = this.getPeriodTimes(period, isLastDayOfWeek)
                    if (!times) continue

                    endData[clazz.name][day].data[period - 1] = {
                        start: times[0],
                        end: times[1],
                        name: subject?.name ?? "N/A",
                        teacher: teacher?.name ?? "N/A",
                        classroom: classroom?.name ?? "N/A",
                    }
                }
            }
        }

        // get previous data
        const prevData = await ClassWeekData.findOne({ week: this.week })

        // update in database
        await ClassWeekData.updateOne(
            { week: this.week },
            { $set: { data: endData }},
            { upsert: true }
        )

        const changes = checkDiff(prevData, { data: endData })

        const changedClasses: string[] = []

        for (const name of Object.keys(endData)) {
            const prevClass = prevData?.data?.[name]

            if (!prevClass) {
                changedClasses.push(name)
                continue
            }

            const oldNorm = this.normalizeClassData(prevClass)
            const newNorm = this.normalizeClassData(endData[name])

            if (JSON.stringify(oldNorm) !== JSON.stringify(newNorm)) {
                changedClasses.push(name)
            }
        }

        // notify via websocket
        webserverClient.sendWSMessage(JSON.stringify({
            week: this.week,
            type: "updated.classes",
            changedClasses
        }))

        // temporary - send difference to a webhook
        sendWebhook(changes)

        console.debug(`Stored Class Data for Week ${this.week}`)
    }

    /**
     * Stores the parsed teacher into the Database
     */
    public async storeTeacherData() {
        if (!this.index) await this.loadIndex(this.week)

        const endData: Record<string, any> = {}
        
        for (const card of this.index.cards) {
            // get lesson information
            const lesson = this.index.lessons[card.lessonid]

            // period division, much more easier to work with
            var period = Math.ceil(card.period / 2)

            // index information
            const classroom = this.index.classrooms[card.classroomids[0]]
            const teacher = this.index.teachers[lesson.teacherids[0]] // TODO: There could be multiple teachers...
            const subject = this.index.subjects[lesson.subjectid]
            const clazz = this.index.classes[lesson.classids[0]] // TODO: There could be multiple classes...

            // get day info
            const dayInfo = await this.getDayById(card.days)
            if (!dayInfo) continue

            const { day, name, shortName, isLastDayOfWeek } = dayInfo
            const duration = Math.ceil(lesson.durationperiods / 2)

            // if teacher name doesn't exist, skip
            if (teacher?.name === null || teacher?.name === undefined) {
                const format = `${this.week}-${clazz?.name}`

                if (this.ignoreFutureWarnings.includes(format)) return
                this.ignoreFutureWarnings.push(format)

                console.warn(`Skipping storing class for teacher because no name provided. week = ${this.week}; class = ${clazz?.name ?? "N/A"}`)
                continue
            }

            // ensures day object exists
            this.ensureDay(endData, teacher.name, day, name, shortName)

            // store each period
            for (var i = 0; i < duration; i++, period++) {
                const times = this.getPeriodTimes(period, isLastDayOfWeek)
                if (!times) continue

                endData[teacher.name][day].data[period - 1] = {
                    start: times[0],
                    end: times[1],
                    name: subject?.name ?? "N/A",
                    class: clazz?.name ?? "N/A",
                    classroom: classroom?.name ?? "N/A",
                    // ...(lesson.groupnames ? { group: lesson.groupnames } : {}) //* tmp
                }
            }
        }

        // update in database
        await TeacherWeekData.updateOne(
            { week: this.week },
            { $set: { data: endData }},
            { upsert: true }
        )

        console.debug(`Stored Teacher Data for Week ${this.week}`)
    }

    /**
     * Loads the index data from the Database for a specific week
     * @param week The week data to load from EduPage
     */
    private async loadIndex(week: string) {
        const payload: any = await RawScheduleData.findOne({ week })
        if (!payload) throw new Error(`No raw data found for week ${week}`)  

        this.data = payload.data
        this.index = {
            lessons: this.indexById(this.data[18]["data_rows"]),
            classrooms: this.indexById(this.data[11]["data_rows"]),
            teachers: this.indexById(this.data[14]["data_rows"]),
            subjects: this.indexById(this.data[13]["data_rows"]),
            classes: this.indexById(this.data[12]["data_rows"]),

            dayDefs: this.data[4]["data_rows"],
            daysRows: this.data[7]["data_rows"],
            cards: this.data[20]["data_rows"],

            times: [
                ["8:30", "9:50"],
                ["9:10", "11:30"],
                ["12:30", "13:50"],
                ["14:00", "15:20"],
                ["15:30", "16:50"],
                ["17:00", "18:20"]
            ],
            timesWeekend: [
                ["8:10", "9:30"],
                ["9:40", "11:00"],
                ["11:10", "12:30"],
                ["13:00", "14:20"],
                ["14:30", "15:50"],
                ["16:00", "17:20"]
            ]
        }
    }

    /**
     * Ensures that the day object exists
     * @param obj JSON object
     * @param clazz Parent key
     * @param day Day key
     * @param name Name of the day
     * @param shortName Short name of the day
     */
    private ensureDay(obj: any, parent: string, day: string, name: string, shortName: string) {
        if (!obj[parent]) obj[parent] = {}
        if (!obj[parent][day]) {
            obj[parent][day] = {
                day: name,
                dayShort: shortName,
                data: []
            }
        }
    }

    /**
     * Indexes an array of rows by it's ID
     * @param rowsData Array of rows data
     * @returns Indexed rows data by ID
     */
    private indexById(rowsData: any[]) {
        const map: Record<string, any> = {}
        
        for (const row of rowsData) map[row.id] = row
        return map
    }

    /**
     * Gets the correct period time for a specific period and it's day (our weekends have different times)
     * @param period Period number
     * @param isLastDayOfWeek Wethever it's the last day of the week
     * @returns The period times || null if something went wrong (????)
     */
    private getPeriodTimes(period: number, isLastDayOfWeek: boolean) {
        const times = period - 1
        const validate = isLastDayOfWeek ? this.index.timesWeekend[times] : this.index.times[times]

        return validate ?? null
    }

    /**
     * Gets a day object by the ID
     * @param daysdefid Daysdefs ID
     * @returns The day object data
     */
    private async getDayById(daysdefid: string = "00001") {   
        const dayDef = this.index.dayDefs.find((l: any) => l.vals[0] === daysdefid)
        if (!dayDef) return null

        const dayRows = this.index.daysRows
        const day = String(Number(dayDef.id.replace("*", "")) - 1) // gets the correct day - edupages likes to add a random *

        const row = dayRows.find((l: any) => l.id === day)
        if (!row) return null

        const index = dayRows.findIndex((l: any) => l.id === day)

        return {
            day,
            name: row.name,
            shortName: row.short,
            isLastDayOfWeek: index === dayRows.length - 1 // checks if its the last one
        }
    }
    /**
     * Normalizes class data by filtering out empty periods and structuring the data
     * @param clazz Class data
     * @returns Normalized class data
     */
    private normalizeClassData(clazz: any) {
        const out: any = {}

        for (const day of Object.keys(clazz)) {
            out[day] = {
                day: clazz[day].day,
                dayShort: clazz[day].dayShort,
                data: (clazz[day].data ?? [])
                    .filter(Boolean)
                    .map((p: { start: any; end: any; name: any; teacher: any; classroom: any }) => ({
                        start: p.start,
                        end: p.end,
                        name: p.name,
                        teacher: p.teacher,
                        classroom: p.classroom
                    }))
            }
        }

        return out
    }

}