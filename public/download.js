
import { settings } from "/public/lookup.js"

const button = document.getElementById("downloadBtn")
const table = document.getElementById("tableContainer")

button.addEventListener("click", async () => {
    const canvas = await window.html2canvas(table, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    })

    const image = canvas.toDataURL("image/png")

    const link = document.createElement("a")
    link.href = image
    link.download = `${settings.values.main}_${settings.values.week}_schedule.png`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
})
