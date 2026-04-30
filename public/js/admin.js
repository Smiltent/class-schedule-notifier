
export const settings = {
    url: `${window.location.origin}/v2/admin`,
    elements: {
        users: document.getElementById("userTable")
    },
}

//
//   utils
//
async function getUsers() {
    await fetch(`${settings.url}/users/list`)
        .then(res => res.json())
        .then((data) => {
            setUsers(settings.elements.users, data)
        })
}

function setUsers(element, data) {
    element.innerHTML = ''

    const table = document.createElement('table')
    table.style.borderCollapse = 'collapse'

    const maxUsers = data.data.length

    data.forEach((info) => {

    })
}

//
//   main
//
export default async function init() {
    await getUsers()
}