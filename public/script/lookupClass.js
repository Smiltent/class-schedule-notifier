
const URL = `${window.location.origin}/api/v1/weeks`
const WEEK_SELECT = document.getElementById('selectWeek')
const CLASS_SELECT = document.getElementById('selectClass')

var WEEK
var CLASS

var WEEK_DATA

async function getSchoolData() {
    await fetch(`${URL}/list`)
        .then(res => res.json())
        .then((data) => {
            // localStorage.setItem('availableWeeks', JSON.stringify(data))
            setWeekOptions(data["weeks"], data.currentWeek)
        })

    await fetch(`${URL}/class/list`)
        .then(res => res.json())
        .then((data) => {
            // localStorage.setItem('availableClasses', JSON.stringify(data))
            setClassOptions(data["data"])
        })
}

async function getWeekData(week, clazz) {
    await fetch(`${URL}/class/${clazz}/week/${week}`)
        .then(res => res.json())
        .then((data) => {
            WEEK_DATA = data
        })
}

function setWeekOptions(data, selected) {
    data.forEach((week) => {
        const option = document.createElement('option')

        if (week === selected) {
            option.selected = true
            option.innerHTML = `${week} (current)`
        } else {
            option.innerHTML = `${week}`
        }

        option.value = week
        WEEK_SELECT.appendChild(option)
    })
}

function setClassOptions(data) {
    data.forEach((clazz) => {
        const option = document.createElement('option')

        option.value = clazz
        option.innerHTML = clazz

        CLASS_SELECT.appendChild(option)
    })
}

async function createTable() {
    const CONTAINER = document.getElementById('tableContainer')
    CONTAINER.innerHTML = ''

    const table = document.createElement('table')
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'

    const maxLessons = Math.max(
        ...Object.values(WEEK_DATA.data).map(d => d.data.length)
    )

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

    Object.values(WEEK_DATA.data).forEach(day => {
        const row = document.createElement('tr')

        const dayCell = document.createElement('td')
        dayCell.innerText = day.day

        row.appendChild(dayCell)

        day.data.forEach(lesson => {
            const cellContainer = document.createElement('td')
            const cell = document.createElement('div')

            cell.classList.add("lesson-cell")
            cell.style.backgroundColor = randomColorFromString(lesson.name)
            cell.innerHTML = `${lesson.name}<br>(${lesson.teacher} | ${lesson.classroom})`

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

    CONTAINER.appendChild(table)
}

async function init() {
    await getSchoolData()

    const params = new URLSearchParams(window.location.search)
    if (params.has('week')) {
        WEEK = params.get('week')
        WEEK_SELECT.value = WEEK
    } else {
        WEEK = WEEK_SELECT.value
    }

    if (params.has('class')) {
        CLASS = params.get('class')
        CLASS_SELECT.value = CLASS
    } else {
        CLASS = CLASS_SELECT.value
    }

    await getWeekData(WEEK, CLASS)
    await createTable()
}

WEEK_SELECT.addEventListener('change', async (e) => {
    WEEK = e.target.value

    await getWeekData(WEEK, CLASS)
    createTable()
})

CLASS_SELECT.addEventListener('change', async (e) => {
    CLASS = e.target.value

    await getWeekData(WEEK, CLASS)
    createTable()
})

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

init()