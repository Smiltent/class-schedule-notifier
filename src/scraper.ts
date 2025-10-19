
import axios from "axios"
import path from "path"
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

        // req data
        // 54 - last week, 55 - this week (13.10)

        try {
            const res = await axios.post(`${this.url}/timetable/server/regulartt.js?__func=regularttGetData`, { __args: [null, "56"], __gsh: "00000000" }, {
                headers: {
                    "Referer": this.url,
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    // "User-Agent": "Mozilla/5.0 (compatible; Smil-Bot/1.0; +https://school.com)",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
                    "Accept": "*/*"
                }
            })

            console.debug(`Successfully fetched data from ${this.url}`)

            this.storeData(res.data)
        } catch (err) {
            console.error(`Failed to fetch data from ${this.url}: ${err}`)
        }
    }

    // ================= INTERNAL =================
    // temprarily store the data into a file
    private async storeData(data: any) {
        try {
            var dira = path.join(__dirname, "tmp")
            if (!fs.existsSync(dira)) { 
                fs.mkdirSync(dira, { recursive: true }) 
            }
            
            fs.writeFileSync(path.join(dira, "d.json"), JSON.stringify(data, null, 2))
            console.debug("Stored data into /tmp/d.json")
        } catch (err) {
            console.error(`Error writing file: ${err}`)
        }
    }
}