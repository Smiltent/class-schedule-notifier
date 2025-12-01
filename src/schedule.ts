
import RawScheduleData from "./db/models/RawScheduleData.ts"
import TeacherWeekData from "./db/models/TeacherWeekData.ts"
import ClassWeekData from "./db/models/ClassWeekData.ts"

export default class Schedule {
    private week!: string

    private data: any
    private index: any

    // initialize class
    public async i(week: string) {
        this.week = week

        await this.loadIndex(week)
    }

    public async storeClassData() {
        if (!this.index) await this.loadIndex(this.week)

        const endData: Record<string, any> = {}
        
        for (const card of this.index.cards) {
            if (!card.days || !card.period) continue // check if it has a day / period

            // get lesson information
            const lesson = this.index.lessons[card.lessonid]
            if (!lesson) continue

            //? this will totally not cause issues later in the future
            var period = Math.ceil(card.period / 2)

            const classroom = this.index.classrooms[card.classroomids[0]]
            const teacher = this.index.teachers[lesson.teacherids[0]]
            const subject = this.index.subjects[lesson.subjectid]
            const clazz = this.index.classes[lesson.classids[0]]

            // get day info
            const dayInfo = await this.getDayById(card.days)
            if (!dayInfo) continue

            const { day, name, shortName, isLastDayOfWeek } = dayInfo
            const duration = Math.ceil(lesson.durationperiods / 2)

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
                    // ...(lesson.groupnames ? { group: lesson.groupnames } : {}) // tmp
                }
            }
        }

        await ClassWeekData.updateOne(
            { week: this.week },
            { $set: { data: endData }},
            { upsert: true }
        )

        console.debug(`Stored Class Data for Week ${this.week}`)
    }

    public async storeTeacherData() {
        if (!this.index) await this.loadIndex(this.week)

        const endData: Record<string, any> = {}
        
        for (const card of this.index.cards) {
            if (!card.days || !card.period) continue // check if it has a day / period

            // get lesson information
            const lesson = this.index.lessons[card.lessonid]
            if (!lesson) continue

            //? this will totally not cause issues later in the future
            var period = Math.ceil(card.period / 2)

            const classroom = this.index.classrooms[card.classroomids[0]]
            const teacher = this.index.teachers[lesson.teacherids[0]]
            const subject = this.index.subjects[lesson.subjectid]
            const clazz = this.index.classes[lesson.classids[0]]

            // get day info
            const dayInfo = await this.getDayById(card.days)
            if (!dayInfo) continue

            const { day, name, shortName, isLastDayOfWeek } = dayInfo
            const duration = Math.ceil(lesson.durationperiods / 2)

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
                    // ...(lesson.groupnames ? { group: lesson.groupnames } : {}) // tmp
                }
            }
        }

        await TeacherWeekData.updateOne(
            { week: this.week },
            { $set: { data: endData }},
            { upsert: true }
        )

        console.debug(`Stored Teacher Data for Week ${this.week}`)
    }

    // ================= INTERNAL =================
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

    private ensureDay(obj: any, clazz: string, day: string, name: string, shortName: string) {
        if (!obj[clazz]) obj[clazz] = {}
        if (!obj[clazz][day]) {
            obj[clazz][day] = {
                day: name,
                dayShort: shortName,
                data: []
            }
        }
    }

    private indexById(rowsData: any[]) {
        const map: Record<string, any> = {}
        
        for (const row of rowsData) map[row.id] = row
        return map
    }

    private getPeriodTimes(period: number, isLastDayOfWeek: boolean) {
        const times = period - 1
        const validate = isLastDayOfWeek ? this.index.timesWeekend[times] : this.index.times[times]

        return validate ?? null
    }

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
}