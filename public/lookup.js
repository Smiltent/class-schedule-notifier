
export const settings = {
    url: `${window.location.origin}/api/v1/weeks`,
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
    }
}

//
//   utils
//
async function getSchoolData(type) {
    await fetch(`${settings.url}/list`)
        .then(res => res.json())
        .then((data) => {
            settings.values.week = data.currentWeek

            setWeekOptions(settings.elements.week, data["weeks"], data.currentWeek)
        })

    await fetch(`${settings.url}/${type}/list`)
        .then(res => res.json())
        .then((data) => {
            settings.values.main = data["data"][0]

            setMainOptions(settings.elements.main, data["data"])
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
    const header = document.createElement('tr')

    const dayTh = document.createElement('th')
    dayTh.innerText = 'day'
    header.appendChild(dayTh)

    for (let i = 1; i <= maxLessons; i++) {
        const th = document.createElement('th')
        th.innerText = `${i}. period`
        header.appendChild(th)
    }

    table.appendChild(header)

    // insert days
    Object.values(settings.weekData.data).forEach(day => {
        const row = document.createElement('tr')

        const dayCell = document.createElement('td')
        dayCell.innerText = day.day
        row.appendChild(dayCell)

        day.data.forEach(lesson => {
            const cellContainer = document.createElement('td')
            const cell = document.createElement('div')

            if (lesson != null) {
                cell.classList.add("lesson-cell")
                cell.style.backgroundColor = randomColorFromString(lesson.name)

                cell.innerHTML = settings.formats[type]
                    .replace('%name%', lesson.name)
                    .replace('%teacher%', lesson.teacher)
                    .replace('%class%', lesson.class)
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

        table.appendChild(row)
    })

    container.appendChild(table)
}

function setWeekOptions(element, data, primary = null) {
    data.forEach((week) => {
        const option = document.createElement('option')

        if (week === primary) {
            option.selected = true
            option.innerHTML = `${week} (current)`
        } else {
            option.innerHTML = `${week}`
        }

        option.value = week
        element.appendChild(option)
    })
}

function setMainOptions(element, data) {
    data.forEach((info) => {
        const option = document.createElement('option')

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
export async function setup(type) {
    const table = document.getElementById('tableContainer')

    // get information from API
    await getSchoolData(type)
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

        await getWeekData(type, settings.values.week, settings.values.main)
        createTable(type, table)
    })
}