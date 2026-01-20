
export const settings = {
    url: `${window.location.origin}/v1/weeks`,
    weekData: null,
    values: {
        week: null,
        main: null
    },
    elements: {
        week: null,
        main: null
    },
    formats: {
        class: `%name%<br>(%teacher% | %classroom%)`,
        teacher: `%name%<br>(%class% | %classroom%)`,
    },
    coloring: { // yes, i know its stupid, but i had no other idea on how to do it
        class: '%name%-%teacher%',
        teacher: '%name%-%class%',
    }
}

//
//   utils
//
async function getSchoolData(type, ignore) {
    await fetch(`${settings.url}/list`)
        .then(res => res.json())
        .then((data) => {
            if (!ignore[0]) {
                settings.values.week = data.currentWeek
            }

            setWeekOptions(settings.elements.week, data["weeks"], data.currentWeek)
        })

    await fetch(`${settings.url}/${type}/list`)
        .then(res => res.json())
        .then((data) => {
            if (!ignore[1]) {
                settings.values.main = data["data"][0]
            }

            setMainOptions(settings.elements.main, data["data"], ignore[1] ? settings.values.main : null)
        })
}

async function getWeekData(type, week, getter) {
    await fetch(`${settings.url}/${type}/${getter}/week/${week}`)
        .then(res => res.json())
        .then((data) => {
            settings.weekData = data
        })
}

function createTable(type, container) {
    // reset table
    container.innerHTML = ''

    // create table element
    const table = document.createElement('table')
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'

    // determine max lessons in a day for header
    const maxLessons = Math.max(
        ...Object.values(settings.weekData.data).map(d => d.data.length)
    )

    // header logic
    const thead = document.createElement('thead')
    const dayTr = document.createElement('tr')

    const dayTh = document.createElement('th')
    dayTh.innerText = 'day'
    dayTr.appendChild(dayTh)

    for (let i = 1; i <= maxLessons; i++) {
        const th = document.createElement('th')
        th.innerText = `${i}. period`
        dayTr.appendChild(th)
    }

    thead.appendChild(dayTr)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')

    // insert lessons and days
    Object.values(settings.weekData.data).forEach(day => {
        const row = document.createElement('tr')

        const dayCell = document.createElement('td')
        dayCell.classList.add('day')

        const dayParts = day.day.split(',').map(part => part.trim())
        dayCell.innerText = dayParts.join(', ')

        row.appendChild(dayCell)

        day.data.forEach(lesson => {
            const cellContainer = document.createElement('td')
            const cell = document.createElement('div')

            if (lesson != null) {
                cell.classList.add("lesson-cell")

                cell.style.backgroundColor = lesson.teacher === "Toms Ričards Krieviņš" ? "#5c5c5c" : randomColorFromString(
                    settings.coloring[type]
                        .replace('%name%', lesson.name)
                        .replace('%teacher%', lesson.teacher)
                        .replace('%class%', lesson.class)
                )

                cell.innerHTML = settings.formats[type]
                    .replace('%name%', lesson.name)
                    .replace('%teacher%', `<a class="colorText" href="/teacher?teacher=${encodeURIComponent(lesson.teacher)}">${lesson.teacher}</a>`)
                    .replace('%class%', `<a class="colorText" href="/class?class=${encodeURIComponent(lesson.class)}">${lesson.class}</a>`)
                    .replace('%classroom%', lesson.classroom)
            }

            cellContainer.appendChild(cell)
            row.appendChild(cellContainer)
        })

        const missing = maxLessons - day.data.length;
        for (let i = 0; i < missing; i++) {
            const emptyCell = document.createElement('td')
            emptyCell.innerHTML = '&nbsp;'
            row.appendChild(emptyCell)
        }

        tbody.appendChild(row)
    })

    table.appendChild(tbody)
    container.appendChild(table)
}

function setWeekOptions(element, data, primary = null) {
    data.forEach((week) => {
        const option = document.createElement('option')

        const weekDisplay = week == "67" ? "that one un-funny number" : week

        if (week === primary) {
            option.selected = true
            option.innerHTML = `${weekDisplay} (current)`
        } else {
            option.innerHTML = `${weekDisplay}`
        }

        option.value = week
        element.appendChild(option)
    })
}

function setMainOptions(element, data, primary = null) {
    data.forEach((info) => {
        const option = document.createElement('option')

        if (info === "Koordinators") return

        if (info === primary) {
            option.selected = true
        }

        option.value = info
        option.innerHTML = info

        element.appendChild(option)
    })
}

//
//   helper
//
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i)
        hash |= 0
    }
    return hash
}

function randomColorFromString(str) {
    const hue = Math.abs(hashCode(str)) % 360
    const sat = 60 + (Math.abs(hashCode(str)) % 20) 

    return `hsl(${hue}, ${sat}%, 25%)`
}

//
//   main
//
export async function setup(type, ignore = [false, false]) {
    const table = document.getElementById('tableContainer')

    // get information from API
    await getSchoolData(type, ignore)
    await getWeekData(type, settings.values.week, settings.values.main)

    createTable(type, table)

    // setup event listeners
    settings.elements.week.addEventListener('change', async (e) => {
        settings.values.week = e.target.value

        await getWeekData(type, settings.values.week, settings.values.main)
        createTable(type, table)
    })

    settings.elements.main.addEventListener('change', async (e) => {
        settings.values.main = e.target.value

        // Store last lookup in localStorage
        localStorage.setItem("lastLookup" + (type.charAt(0).toUpperCase() + type.slice(1)), settings.values.main)

        await getWeekData(type, settings.values.week, settings.values.main)
        createTable(type, table)
    })
}