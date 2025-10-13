
import axios from "axios"
import fs from "fs"

export default class Scraper {
    private url: string

    constructor(url: string) {
        this.url = url
    }

    public async getClassScheduleData() {
        // adds the https tag, if the url does not provide it
        if (!this.url.startsWith("https://") && !this.url.startsWith("http://")) {
            this.url = `https://${this.url}`
        }

        console.debug(`Current URL => ${this.url}`)

        // req data
        const res = await axios.post(`${this.url}/timetable/server/regulartt.js?__func=regularttGetData`, { __args: [null, "55"], __gsh: "00000000" }, {
            headers: {
                "Referer": this.url,
                "Content-Type": "application/json; charset=utf-8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "User-Agent": "Mozilla/5.0 (compatible; Smil-Bot/1.0; +https://school.com)",
                "Accept": "*/*"
            }
        })

        this.storeData(res.data)
    }

    // ================= INTERNAL =================
    // temprarily store the data into a file
    private async storeData(data: any) {
        try {
            fs.writeFileSync("./src/tmp/d.json", JSON.stringify(data, null, 2))
        } catch (err) {
            console.error(`Error writing file: ${err}`)
        }
    }
}