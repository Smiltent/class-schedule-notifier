
export const settings = {
    url: `${window.location.origin}/v1/admin`,
    elements: {
        users: document.getElementById("userSelect")
    },
}

async function getUsers() {
    await fetch(`${settings.url}/users/list`)
        .then(res => res.json())
        .then((data) => {
            setUsers(settings.elements.users, data)
        })
}

function setUsers(element, data) {

}