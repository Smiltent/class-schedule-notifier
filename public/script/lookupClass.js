
const URL = `${window.location.origin}/api/v1/weeks`
const SELECT_CLASS = document.getElementById('selectClass')
const SELECT_WEEK = document.getElementById('selectWeek')

var scheduleData

async function getData() {
    await fetch(`${URL}/list`)
        .then(res => res.json())
        .then((data) => {
            localStorage.setItem('availableWeeks', JSON.stringify(data))

            scheduleData = data
            setWeekOptions(data["weeks"], data.currentWeek)
        }).catch(() => {
            console.error(`Ratelimited, using local storage (if exists)`)
            setWeekOptions(JSON.parse(localStorage.getItem('availableWeeks')), JSON.parse(localStorage.getItem('availableWeeks'))["currentWeek"])
        })

    // await fetch(`${URL}/class/list`)
    //     .then(res => res.json())
    //     .then((data) => { // TODO: fix, data is undefined
    //         localStorage.setItem('availableClasses', JSON.stringify(data))
    //         setClassOptions(data["data"], localStorage.getItem('selectedClass'))
    //     }).catch(() => {
    //         console.error(`Ratelimited, using local storage (if exists)`)
    //         setClassOptions(JSON.parse(localStorage.getItem('availableClasses')), localStorage.getItem('selectedClass'))
    //     })

    await fetch(`${URL}/`)
}

function setWeekOptions(data, selected) {
    data.forEach((week) => {
        const option = document.createElement('option')

        if (week === selected) {
            option.selected = true
        }

        option.value = week
        option.innerHTML = `${week} (the data, which doesn't exist yet)`

        SELECT_WEEK.appendChild(option)
    })
}

function setClassOptions(data, selected) {
    data.forEach((clazz) => {
        const option = document.createElement('option')

        if (clazz === selected) {
            option.selected = true
        }

        option.value = clazz
        option.innerHTML = clazz

        SELECT_CLASS.appendChild(option)
    })
}

async function showTable() {
    const CONTAINER = document.getElementById('tableContainer')


}

// store selected class in local storage
SELECT_CLASS.addEventListener('change', (event) => {
    localStorage.setItem('selectedClass', event.target.value)
})

getData()
showTable()