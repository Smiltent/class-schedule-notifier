
// ================= STATIC DATA =================
import friLessonTimes from "./static/friLessonTimes.json"
import lessonTimes from "./static/lessonTimes.json"

import leven from "js-levenshtein"
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
        this.parseDataIntoFiles(file)
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
    private async parseDataIntoFiles(file: any) {
        fs.readFile(file, "utf8", async (err, data) => {
            this.rawJsonData = await JSON.parse(data)
            
            fs.writeFileSync("./src/tmp/seperate/days.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][6]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/weeks.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][7]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/terms.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][8]["data_rows"], null, 2))

            fs.writeFileSync("./src/tmp/seperate/periods.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][1]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/classrooms.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][11]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/classes.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][12]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/subjects.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][13]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/teachers.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][14]["data_rows"], null, 2))
            // fs.writeFileSync("./src/tmp/seperate/divisions.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][16]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/lessons.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][18]["data_rows"], null, 2))
            fs.writeFileSync("./src/tmp/seperate/cards.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][20]["data_rows"], null, 2))
            // fs.writeFileSync("./src/tmp/seperate/studentsubjects.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][21]["data_rows"], null, 2))

            console.debug("Seperated data to /tmp/seperate/...")

            this.parseDataIntoSeperateClasses()
        })
    }

    private async parseDataIntoSeperateClasses() {
        // == EXPLANATION TIME == 
        // when a user asks for a group (e.g. IP25), it will grab the ID from `classes.json`
        // it will find all classes assosiated using the ID from `classes.json`
        // then, all the other data will get parsed through its assosiated file

        var subjects = JSON.parse(fs.readFileSync("./src/tmp/seperate/subjects.json").toString())
        var teachers = JSON.parse(fs.readFileSync("./src/tmp/seperate/teachers.json").toString())
        var classrooms = JSON.parse(fs.readFileSync("./src/tmp/seperate/classrooms.json").toString())
        var cards = JSON.parse(fs.readFileSync("./src/tmp/seperate/cards.json").toString())
        var classes = JSON.parse(fs.readFileSync("./src/tmp/seperate/classes.json").toString())
        var lessons = JSON.parse(fs.readFileSync("./src/tmp/seperate/lessons.json").toString())

        const lessonData: Record<string, any> = {}

        const createEmpty = () => ({
            "10000": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "01000": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "00100": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "00010": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
            "00001": { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} }
        })
    
        for (const card of cards) {
            if (card.classroomids[0] == "" || card.period == "") continue

            for (const lesson of lessons) {
                // if (!lesson.classids?.includes("-175")) continue
                if (card.lessonid !== lesson.id) continue

                var example = {
                    id: lesson.id,
                    classroom: "",
                    name: subjects.find((s: any) => s.id === lesson.subjectid)?.name,
                    teacher: teachers.find((s: any) => s.id === lesson.teacherids[0])?.name,
                }

                const duration = lesson.durationperiods / 2
                const repeat = lesson.count && lesson.count > 2 ? lesson.count : 1

                for (const classroomid of card.classroomids) {
                    const classroomName = classrooms.find((s: any) => s.id === classroomid)?.name
                    if (!classroomName) continue 
                    example.classroom = classroomName
                }

                for (const classId of lesson.classids) {
                    const classIdName = classes.find((s: any) => s.id === classId)?.name
                    if (!classIdName) continue

                    if (!lessonData[classIdName]) {
                        lessonData[classIdName] = createEmpty()
                    }

                    const startPeriod = Math.ceil(card.period / 2);
                    let canPlace = true

                    for (let j = 0; j < duration; j++) {
                        const period = startPeriod + j
                        if (period > 5) {
                            canPlace = false
                            break
                        }
                        const currentSlot = lessonData[classIdName][card.days][String(period)]
                        if (Object.keys(currentSlot).length > 0) {
                            canPlace = false
                            break
                        }
                    }

                    if (canPlace) {
                        for (let j = 0; j < duration; j++) {
                            const period = startPeriod + j
                            lessonData[classIdName][card.days][String(period)] = example
                        }
                    }

                }
            }
        }

        // Write each class file
        // IMPROVE: this is a bad way of doing it
        for (const [classId, lessonsForClass] of Object.entries(lessonData)) {
            fs.writeFileSync(`./src/tmp/lessons/${classId}.json`, JSON.stringify(lessonsForClass, null, 2));
        }

        console.info("done!")
    }
}


/*
  BUGS TODO:
    

*/