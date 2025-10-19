
import friLessonTimes from "./static/friLessonTimes.json"
import lessonTimes from "./static/lessonTimes.json"
import path from "path"
import fs from "fs"

export default class Schedule {
    // raw data
    private rawData: any
    private rawJsonData: any = {}

    // parsed data
    private lessons!: JSON
    private teachers!: JSON
    private classes!: JSON

    constructor(file: any) {
        this.storeRawData(file)
    }

    public getLessonByClassName(clazz: string) {
        // uses closeEnough() to check if its close enough to a class name
        // returns all classes, teachers and classrooms that are during the week
    } 

    public getLessonByName(name: string) {
        // uses closeEnough() to check if its close enough to a lessons name
        // returns all lessons that are 
    }

    public getTeachersLessonsByName(teacher: string) {
        // uses closeEnough() to check if its close enough to a teachers name
        // returns all lessons that are happening during the week to a teacher
    }

    public getLessonTimes(weekDay: number) {
        if (weekDay >= 7) {
            return friLessonTimes
        } else {
            return lessonTimes
        }
    }

    public getLessonTimeByPeriod(weekDay: number, period: number) { 
        if (weekDay >= 7) {
            return friLessonTimes[period]
        } else {
            return lessonTimes[period]
        }
    }

    // ================= INTERNAL =================
    // parses the large list of data, into actual readable data
    private async storeRawData(file: any) {
        fs.readFile(file, "utf8", async (err, data) => {
            this.rawJsonData = await JSON.parse(data)
            console.debug("Stored raw data into /src/tmp/d.json")

            this.parseDataIntoSeperateClasses()
        })
    }

    private async parseDataIntoSeperateClasses() {
        // clean up old data
        var dir = path.join(__dirname, "tmp", "classes")
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
                teacher: teacherMap[lesson.teacherids?.[0]]?.name,
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
            const duration = lesson.durationperiods / 2 // devided by 2, because we have 
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
            var dir = path.join(__dirname, "tmp", "classes");
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(path.join(dir, `${classId}.json`), JSON.stringify(lessonsForClass, null, 2));
        }

        console.info("done!")
    }
}