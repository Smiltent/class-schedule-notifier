
import RawScheduleData from "./db/models/RawScheduleData.ts"
import TeacherWeekData from "./db/models/TeacherWeekData.ts"
import ClassWeekData from "./db/models/ClassWeekData.ts"

export default class Schedule {
    private data: any

    public async storeClassIntoDatabase(week: string) {
        /*
         TODO: [ ] - handle group lessons (figure it out from edupage)
        */

        try {
            const payload: any = await RawScheduleData.findOne({ week: week })
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
                var period = Math.ceil(card.period / 2)

                // get day info
                const { day, name, shortName, isLastDayOfWeek } = await this.getDayById(card.days)

                // get correct times
                const { weekTimes, weekEndTimes } = await this.getPeriodTimes(period)
                var periodTimes = isLastDayOfWeek ? weekEndTimes : weekTimes

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

                // allow repeating lessons to be stored
                const duration = Math.ceil(lesson.durationperiods / 2)
                for (let i = 0; i < duration; i++) {
                    const { weekTimes, weekEndTimes } = await this.getPeriodTimes(period)
                    periodTimes = isLastDayOfWeek ? weekEndTimes : weekTimes

                    data = {
                        ...data,
                        start: periodTimes ? periodTimes[0] : "N/A",
                        end: periodTimes ? periodTimes[1] : "N/A"
                    }

                    endData[clazz.name][day].data[period - 1] = data
                    period++
                }
            }
            
            await ClassWeekData.updateOne(
                { week },
                { $set: { data: endData }},
                { upsert: true }
            )
            console.debug(`Stored Class Data  for Week ${week}`)
        } catch (err) {
            console.error(`Failed to store Class Data for Week ${week}: ${err}`)  
        }
    }

    public async storeTeacherDataIntoDatabase(week: string) {
        /*
         TODO: [ ] - work on this (idk what todo to make) 
         TODO: [ ] - handle group lessons (figure it out from edupage)
        */
       
        try {
            const payload: any = await RawScheduleData.findOne({ week: week })
            this.data = payload.data
            var endData: any = {}

            for (const card of this.data[20]["data_rows"]) {
                // if (!card.classroomids[0] || !card.period) continue // check if it has a classroom / period
                
                // const lesson = this.data[18]["data_rows"].find((l: any) => l.id === card.lessonid)
                // const classroom = this.data[11]["data_rows"].find((l: any) => l.id === card.classroomids[0])
                // const teacher = this.data[14]["data_rows"].find((l: any) => l.id === lesson.teacherids[0])
                // const subject = this.data[13]["data_rows"].find((l: any) => l.id === lesson.subjectid)
                // const clazz = this.data[12]["data_rows"].find((l: any) => l.id === lesson.classids[0])

                // // periods (we have pair-periods)
                // var period = Math.ceil(card.period / 2)

                // // get day info
                // const { day, name, shortName, isLastDayOfWeek } = await this.getDayById(card.days)

                // // get correct times
                // const { weekTimes, weekEndTimes } = await this.getPeriodTimes(period)
                // var periodTimes = isLastDayOfWeek ? weekEndTimes : weekTimes

                // var data = {
                //     start: periodTimes ? periodTimes[0] : "N/A",
                //     end: periodTimes ? periodTimes[1] : "N/A",
                //     name: subject.name,
                //     teacher: teacher.name,
                //     classroom: classroom.name
                // }

                // endData = { 
                //     ...endData, 
                //     [clazz.name]: { 
                //         ...(endData[clazz.name] || {}),
                //         [day]: { 
                //             day: name, 
                //             dayShort: shortName,
                //             data: [
                //                 ...((endData[clazz.name]?.[day]?.data) || [])
                //             ]
                //         }
                //     }
                // }

                // // allow repeating lessons to be stored
                // const duration = Math.ceil(lesson.durationperiods / 2)
                // for (let i = 0; i < duration; i++) {
                //     const { weekTimes, weekEndTimes } = await this.getPeriodTimes(period)
                //     periodTimes = isLastDayOfWeek ? weekEndTimes : weekTimes

                //     data = {
                //         ...data,
                //         start: periodTimes ? periodTimes[0] : "N/A",
                //         end: periodTimes ? periodTimes[1] : "N/A"
                //     }

                //     endData[clazz.name][day].data[period - 1] = data
                //     period++
                // }
            }

            await TeacherWeekData.updateOne(
                { week },
                { $set: { data: endData }},
                { upsert: true }
            )
            console.debug(`Stored Teacher Data for Week ${week}`)
        } catch (err) {
            console.error(`Failed to store Teacher Data for Week ${week}: ${err}`)
        }
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
            isLastDayOfWeek: index === daysRows.length - 1 // checks if its the last one
        }
    }
}