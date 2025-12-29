
const URL = `${window.location.origin}/api/v1/weeks`
const WEEK_SELECT = document.getElementById('selectWeek')
const TEACHER_SELECT = document.getElementById('selectTeacher')

var WEEK
var TEACHER

var WEEK_DATA

async function getSchoolData() {
    await fetch(`${URL}/list`)
        .then(res => res.json())
        .then((data) => {
            setWeekOptions(data["weeks"], data.currentWeek)
        })

    await fetch(`${URL}/teacher/list`)
        .then(res => res.json())
        .then((data) => {
            setTeacherOptions(data["data"])
        })
}

async function getWeekData(week, teacher) {
    await fetch(`${URL}/teacher/${encodeURIComponent(teacher)}week/${week}`)
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
        }

        option.value = week
        option.innerHTML = `${week}`

        WEEK_SELECT.appendChild(option)
    })
}

function setTeacherOptions(data) {
    data.forEach((teacher) => {
        const option = document.createElement('option')

        option.value = teacher
        option.innerHTML = teacher

        TEACHER_SELECT.appendChild(option)
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
    dayTh.innerText = 'DAY'
    header.appendChild(dayTh)

    for (let i = 1; i <= maxLessons; i++) {
        const th = document.createElement('th')
        th.innerText = `${i}.`
        header.appendChild(th)
    }

    table.appendChild(header)

    Object.values(WEEK_DATA.data).forEach(day => {
        const row = document.createElement('tr')

        const dayCell = document.createElement('td')
        dayCell.innerText = day.day
        row.appendChild(dayCell)

        day.data.forEach(lesson => {
            const cell = document.createElement('td');
            cell.innerText = `${lesson.name} (${lesson.class})`
            row.appendChild(cell)
        });

        const missing = maxLessons - day.data.length;
        for (let i = 0; i < missing; i++) {
            const emptyCell = document.createElement('td')
            emptyCell.innerHTML = '&nbsp;'
            row.appendChild(emptyCell)
        }

        table.appendChild(row)
    });

    CONTAINER.appendChild(table)
}

async function init() {
    await getSchoolData()

    const params = new URLSearchParams(window.location.search)
    if (params.has('week')) {
        WEEK = params.get('week')
    } else {
        WEEK = WEEK_SELECT.value
    }

    if (params.has('teacher')) {
        TEACHER = params.get('teacher')
    } else {
        TEACHER = TEACHER_SELECT.value
    }

    await getWeekData(WEEK, TEACHER)
    await createTable()
}

WEEK_SELECT.addEventListener('change', async (e) => {
    WEEK = e.target.value

    await getWeekData(WEEK, TEACHER)
    createTable()
})

TEACHER_SELECT.addEventListener('change', async (e) => {
    TEACHER = e.target.value

    await getWeekData(WEEK, TEACHER)
    createTable()
})

init()