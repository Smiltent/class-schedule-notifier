
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
        try {
            fs.readFile(file, "utf8", async (err, data) => {
                this.rawJsonData = await JSON.parse(data)
                
                fs.writeFileSync("./src/tmp/seperate/periods.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][1]["data_rows"], null, 2))
                fs.writeFileSync("./src/tmp/seperate/classrooms.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][11]["data_rows"], null, 2))
                fs.writeFileSync("./src/tmp/seperate/classes.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][12]["data_rows"], null, 2))
                fs.writeFileSync("./src/tmp/seperate/subjects.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][13]["data_rows"], null, 2))
                fs.writeFileSync("./src/tmp/seperate/teachers.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][14]["data_rows"], null, 2))
                fs.writeFileSync("./src/tmp/seperate/divisions.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][16]["data_rows"], null, 2))
                fs.writeFileSync("./src/tmp/seperate/lessons.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][18]["data_rows"], null, 2))
                // fs.writeFileSync("./src/tmp/seperate/cards.json", JSON.stringify(this.rawJsonData["r"]["dbiAccessorRes"]["tables"][20]["data_rows"], null, 2))

                console.debug("Seperated all Data into seperate Files")
            })
        } catch (err) {
            console.error(`Error parsing data into files: ${err}`)
        }
    }

    private async parseDataIntoSeperateClasses(file: any) {
        // == EXPLANATION TIME == 
        // when a user asks for a group (e.g. IP25), it will grab the ID from `classes.json`
        // it will find all classes assosiated using the ID from `classes.json`
        // then, all the other data will get parsed through its assosiated file

        fs.readFileSync
    }

    // its called close enough, as it checks if the name is close enough to something and provides it
    private async closeEnough(data: any) {
        // use the levenshtein algorithm, to check if its close enough to a class, teachers name or lessons name

        
    }
}