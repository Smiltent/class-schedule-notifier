
import axios from "axios"


const HEADERS = (url: string) => ({
    "Referer": url,
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0",
    "Accept": "*/*"
})

const res = await axios.post(`https://pteh.edupage.org/timetable/server/regulartt.js?__func=regularttGetData`, { __args: [null, "5"], __gsh: "00000000" }, {
    headers: HEADERS("https://pteh.edupage.org")
})

console.log(res.data)