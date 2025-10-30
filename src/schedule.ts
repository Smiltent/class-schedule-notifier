
import friLessonTimes from "./static/friLessonTimes.json"
import lessonTimes from "./static/lessonTimes.json"
import path from "path"
import fs from "fs"

export default class Schedule {
    // raw data
    private rawJsonData: any = {}

    constructor(file: any, week: string) {
        this.storeRawData(file, week)
    }

    public getLessonByClassId(clazz: string) {

    } 

    public getLessonById(name: string) {

    }

    public getTeachersLessonsById(teacher: string) {

    }

    public getLessonTimes(weekDay: number) {
        if (weekDay >= 7) {
            return friLessonTimes
        } else {
            return lessonTimes
        }
    }

    // ================= INTERNAL =================
    // parses the large list of data, into actual readable data
    private async storeRawData(file: any, week: string) {
        fs.readFile(file, "utf8", async (err, data) => {
            this.rawJsonData = await JSON.parse(data)
            console.debug("Stored raw data into /src/tmp/d.json")

            this.parseDataIntoSeperateClasses(week)
        })
    }

    private async parseDataIntoSeperateClasses(week: string) {
        // clean up old data
        var dir = path.join(__dirname, "tmp", "current")
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true })
        }

        const rawData = this.rawJsonData["r"]["dbiAccessorRes"]["tables"]

        // define variables
        const classrooms = rawData[11]["data_rows"]
        const classes = rawData[12]["data_rows"]
        const subjects = rawData[13]["data_rows"]
        const teachers = rawData[14]["data_rows"]
        const lessons = rawData[18]["data_rows"]
        const cards = rawData[20]["data_rows"]

        const lessonData: Record<string, any> = {}

        // premake map lookups
        const subjectMap = Object.fromEntries(subjects.map((s: any) => [s.id, s]))
        const teacherMap = Object.fromEntries(teachers.map((t: any) => [t.id, t]))
        const classroomMap = Object.fromEntries(classrooms.map((c: any) => [c.id, c]))
        const classMap = Object.fromEntries(classes.map((c: any) => [c.id, c]))
        const lessonMap = Object.fromEntries(lessons.map((l: any) => [l.id, l]))

        // create an empty json template
        const createEmpty = () => JSON.parse(JSON.stringify({
            "data": {
                "id": null,
                "teachers": []
            },
            "10000": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "01000": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "00100": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "00010": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "00001": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} }
        }))
    
        for (const card of cards) {
            if (card.classroomids[0] == "" || card.period == "") continue

            // define & check if the lesson exists
            const lesson = lessonMap[card.lessonid]
            if (!lesson) continue

            // define the object
            const example = {
                id: lesson.id,
                classroom: null,
                name: subjectMap[lesson.subjectid]?.name,
                teachers: lesson.teacherids.map((t: string) => teacherMap[t]?.name).filter((name: string | undefined) => name),
            }

            // search every classroom id and assign the first one found
            for (const cid of card.classroomids) {
                const classroom = classroomMap[cid]
                if (classroom?.name) {
                    example.classroom = classroom.name
                    break
                }
            }

            // search every lesson, and if it matches to a specific class, assign it to it
            const duration = lesson.durationperiods / 2 // devided by 2, because we have double-periods. this will totally not cause an issue in the future
            for (const cid of lesson.classids) {
                const classInfo = classMap[cid]
                if (!classInfo?.name) continue

                const className = classInfo.name
                if (!lessonData[className]) {
                    lessonData[className] = createEmpty()
                }

                const startPeriod = Math.ceil(card.period / 2);
                var canPlace = true

                for (let j = 0; j < duration; j++) {
                    const period = startPeriod + j
                    if (period > 5 || Object.keys(lessonData[classInfo.name][card.days][String(period)]).length > 0) {
                        canPlace = false
                        break
                    } 
                }

                if (canPlace) {
                    for (let j = 0; j < duration; j++) {
                        const period = startPeriod + j
                        lessonData[classInfo.name][card.days][String(period)] = example
                    }
                }
            }
        }

        // Write each class file
        // IMPROVE: this is a bad way of doing it
        for (const [classId, lessonsForClass] of Object.entries(lessonData)) {
            var dir = path.join(__dirname, "tmp", "classes")
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(path.join(dir, `${classId}.json`), JSON.stringify(lessonsForClass, null, 2))
        }

        console.info("done!")
    }
}