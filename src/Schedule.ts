
import Lesson from "./db/Lesson.ts"
import RawScheduleData from "./db/RawScheduleData.ts"
import Week from "./db/Week.ts"

export default class Schedule {
    private week!: string

    private index: any
    private data: any

    /**
     * Initializes the Schedule parser for a specific week
     * @param week The week to parse from Edupage
     */
    public async i(
        week: string,
    ) {
        this.week = week 
        await this.loadIndex(week)
    }

    /**
     * Stores the parsed lesson into the database
     */
    public async storeLessonData() {
        if (!this.index) await this.loadIndex(this.week)

        const weekObjectId = await Week.findOne({ weekId: this.week })
        if (weekObjectId === null) {
            console.error("Week doesn't exist...")
            return
        }

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

            // get day info
            const dayInfo = await this.getDayById(card.days)
            if (!dayInfo) continue

            const { day, name, shortName, isLastDayOfWeek } = dayInfo
            const duration = Math.ceil(lesson.durationperiods / 2)

            try {
                for (const clazz of classes) {
                    // store each period
                    for (var i = 0; i < duration; i++, period++) {
                        const times = this.getPeriodTimes(period, isLastDayOfWeek)
                        if (!times) continue

                        const group = groups.find((g: any) => g.classid === clazz.id)

                        const query = {
                            week: weekObjectId,
                            period,
                            day,
                            class: clazz.name,
                            group: group.entireclass ? "all" : group.name
                        }

                        const data = {
                            classroom: classroom?.name ?? "N/A",
                            name: subject?.name ?? "N/A",
                            teachers: teachers?.map((t: any) => t.name) ?? [],
                        }

                        const existing = await Lesson.findOne(query)
                        const changes: any[] = []

                        if (existing) {
                            if (existing.classroom !== data.classroom) changes.push({
                                date: new Date(), type: "classroom", from: existing.classroom, to: data.classroom
                            })

                            if (existing.name !== data.name) changes.push({ 
                                date: new Date(), type: "name", from: existing.name, to: data.name
                            })

                            if (JSON.stringify(existing.teachers.sort()) !== JSON.stringify(data.teachers.sort())) changes.push({
                                date: new Date(), type: "teachers", from: existing.teachers, to: data.teachers
                            })
                        }

                        await Lesson.updateOne(
                            query,
                            {
                                $set: data,
                                $push: {
                                    changes: { $each: changes }
                                },
                                $setOnInsert: { changes: [] }
                            },
                            { upsert: true }
                        )
                    }
                }
            } catch (err) {
                console.error(`Error trying to store Lesson Data: ${err}`)
            }
        }

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
            classrooms: this.indexById(this.data[11]["data_rows"]),
            classes: this.indexById(this.data[12]["data_rows"]),
            subjects: this.indexById(this.data[13]["data_rows"]),
            teachers: this.indexById(this.data[14]["data_rows"]),
            groups: this.indexById(this.data[15]["data_rows"]),
            lessons: this.indexById(this.data[18]["data_rows"]),

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
}