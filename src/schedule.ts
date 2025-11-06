
import ClassWeekData from "./db/models/ClassWeekData.ts"
import RawScheduleData from "./db/models/RawScheduleData.ts"

interface timeTypes {
    "start": null,
    "end": null
}

export default class Schedule {
    private data!: any

    constructor() {
        console.debug("Running a new schedule.ts instance...")
    }

    public async storeClassIntoDatabase(week: string) {
        /*
        TODO: 
        [ ] - make sure duration periods are handled correctly (see https://github.com/Smiltent/class-schedule-notifier/blob/0065d580e8ff1b6e862dc4d61e40f666b1f6bcab/src/schedule.ts#L82)
        [ ] - handle group lessons (figure it out from edupage)
        [ ] - better error handling (incase something goes wrong)
        [ ] - make a few code optimisations (this is WAY better than v1)
        */



        const payload: any = await RawScheduleData.findOne({ week })
        this.data = payload.data
        var endData: any = {}

        for (const card of this.data[20]["data_rows"]) {
            if (!card.classroomids[0] || !card.period) continue // check if it has a classroom / period
            
            const lesson = this.data[18]["data_rows"].find((l: any) => l.id === card.lessonid)
            const classroom = this.data[11]["data_rows"].find((l: any) => l.id === card.classroomids[0])
            const teacher = this.data[14]["data_rows"].find((l: any) => l.id === lesson.teacherids[0])
            const subject = this.data[13]["data_rows"].find((l: any) => l.id === lesson.subjectid)
            const clazz = this.data[12]["data_rows"].find((l: any) => l.id === lesson.classids[0])

            // periods (we have pair-periods)
            const period = Math.ceil(card.period / 2)

            // get day info
            const { day, name, shortName, isLastOne } = await this.getDayById(card.days)

            // get correct times
            const { weekTimes, weekEndTimes } = await this.getPeriodTimes(period)
            var periodTimes = isLastOne ? weekEndTimes : weekTimes

            var data = {
                start: periodTimes ? periodTimes[0] : "N/A",
                end: periodTimes ? periodTimes[1] : "N/A",
                name: subject.name,
                teacher: teacher.name,
                classroom: classroom.name
            }

            endData = { 
                ...endData, 
                [clazz.name]: { 
                    ...(endData[clazz.name] || {}),
                    [day]: { 
                        day: name, 
                        dayShort: shortName,
                        data: [
                            ...((endData[clazz.name]?.[day]?.data) || [])
                        ]
                    }
                }
            }

            endData[clazz.name][day].data[period - 1] = data
        }
        
        await ClassWeekData.updateOne(
            { week, },
            { $set: { data: endData }},
            { upsert: true }
        )
    }

    public async storeTeacherDataIntoDatabase(week: string) {
        // TODO: implement
    }

    // ================= INTERNAL =================
    private async getPeriodTimes(period: number) {
        const periodTimes = [
            ["8:30", "9:50"],
            ["9:10", "11:30"],
            ["12:30", "13:50"],
            ["14:00", "15:20"],
            ["15:30", "16:50"],
            ["17:00", "18:20"]
        ]

        const periodTimesWeekend = [
            ["8:10", "9:30"],
            ["9:40", "11:00"],
            ["11:10", "12:30"],
            ["13:00", "14:20"],
            ["14:30", "15:50"],
            ["16:00", "17:20"]
        ]

        return {
            weekTimes: periodTimes[period - 1],
            weekEndTimes: periodTimesWeekend[period - 1]
        }
    }

    private async getDayById(daysdefid: string) {   
        const dayDefs = this.data[4]["data_rows"].find((l: any) => l.vals[0] === daysdefid)
        const daysRows = this.data[7]["data_rows"]

        const day = (Number(dayDefs.id.replace("*", "")) - 1).toString() // edupages likes to add a random *

        const days = daysRows.find((l: any) => l.id === day) // gets data
        const index = daysRows.findIndex((l: any) => l.id === day) // figures out what index day is
        
        return {
            day,
            name: days.name,
            shortName: days.short,
            isLastOne: index === daysRows.length - 1 // checks if its the last one
        }
    }
}