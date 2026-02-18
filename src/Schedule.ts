
import RawScheduleData from "./db/models/RawScheduleData.ts"
import TeacherWeekData from "./db/models/TeacherWeekData.ts"
import ClassWeekData from "./db/models/ClassWeekData.ts"

import sendWebhook from "./util/webhook.ts"
import checkDiff, { checkScheduleChanges } from "./util/diff.ts"
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
     * Stores the parsed lesson into the database
     */
    public async storeLessonData() {
        if (!this.index) await this.loadIndex(this.week)

        const endData: Record<string, any> = {}
        
        for (const card of this.index.cards) {
            // get lesson information
            const lesson = this.index.lessons[card.lessonid]

            // period division, much more easier to work with
            var period = Math.ceil(card.period / 2) 

            // index information
            const teachers = lesson.teacherids?.map((id: string) => this.index.teachers[id])
            const classes = lesson.classids.map((id: string) => this.index.classes[id])
            const groups = lesson.groupids?.map((id: string) => this.index.groups[id])

            const classroom = this.index.classrooms[card.classroomids]
            const subject = this.index.subjects[lesson.subjectid]
            
            // console.log(JSON.stringify(groups))
            // teachers.length > 1 ? console.log(JSON.stringify(teachers)) : null

            // get day info
            const dayInfo = await this.getDayById(card.days)
            if (!dayInfo) continue

            const { day, name, shortName, isLastDayOfWeek } = dayInfo
            const duration = Math.ceil(lesson.durationperiods / 2)

            for (const clazz of classes) {
                // ensures day object exists
                // this.ensureDay(endData, clazz.name, day, name, shortName)

                // store each period
                for (var i = 0; i < duration; i++, period++) {
                    const times = this.getPeriodTimes(period, isLastDayOfWeek)
                    if (!times) continue

                    // endData[clazz.name][day].data[period - 1] = {
                    //     start: times[0],
                    //     end: times[1],
                    //     name: subject?.name ?? "N/A",
                    //     teacher: teacher?.name ?? "N/A",
                    //     classroom: classroom?.name ?? "N/A",
                    // }


                    console.log(JSON.stringify({
                        class: clazz.name,
                        day,
                        period,
                        start: times[0],
                        end: times[1],
                        name: subject?.name ?? "N/A",
                        teachers: teachers?.map((t: any) => t.name) ?? [],
                        classroom: classroom?.name ?? "N/A",
                    }))
                }
            }
        }

        // // get previous data
        // const prevData = await ClassWeekData.findOne({ week: this.week })

        // // update in database
        // await ClassWeekData.updateOne(
        //     { week: this.week },
        //     { $set: { data: endData }},
        //     { upsert: true }
        // )

        // const changes = checkScheduleChanges(prevData, endData)

        // // notify via websocket
        // webserverClient.sendWSMessage(JSON.stringify({
        //     week: this.week,
        //     type: "updated.classes",
        //     changes
        // }))

        console.debug(`Stored Class Data for Week ${this.week}`)
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
            groups: this.indexById(this.data[15]["data_rows"]),
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
     * @deprecated when the hell did I make this... why didn't I use this???
     */
    // private normalizeClassData(clazz: any) {
    //     const out: any = {}

    //     for (const day of Object.keys(clazz)) {
    //         out[day] = {
    //             day: clazz[day].day,
    //             dayShort: clazz[day].dayShort,
    //             data: (clazz[day].data ?? [])
    //                 .filter(Boolean)
    //                 .map((p: { start: any; end: any; name: any; teacher: any; classroom: any }) => ({
    //                     start: p.start,
    //                     end: p.end,
    //                     name: p.name,
    //                     teacher: p.teacher,
    //                     classroom: p.classroom
    //                 }))
    //         }
    //     }

    //     return out
    // }
}