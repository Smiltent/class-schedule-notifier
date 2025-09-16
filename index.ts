
import { DOMParser } from "xmldom"
import path from "path"
import fs from "fs"

const dataPath = path.join(__dirname, "data.txt")
const data = fs.readFileSync(dataPath, "utf-8")

type Lesson = {
    subject: string
    teacher: string
    room: string
}

const lessons: Lesson[] = []

function parse() {
    const parser = new DOMParser().parseFromString(data, "image/svg+xml")

    const rect = Array.from(parser.getElementsByTagName("rect"))

    rect.forEach((r) => {
        const title = r.getElementsByTagName("title")

        if (title.length > 0 ) {
            const titlee = title[0]?.textContent?.trim() || ""
            const lines = titlee.split("\n").map((l: string) => l.trim()).filter(Boolean)

            if (lines.length >= 3) {
                const [subject, teacher, room] = lines

                lessons.push({
                    subject: subject as string,
                    teacher: teacher as string,
                    room: room as string
                })
            }
        }
    })
}

parse()
console.log(lessons)