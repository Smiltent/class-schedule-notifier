
function onLoad() {
    // get & set github commit hash
    fetch(`/git/hash`)
        .then(res => res.text())
        .then(hash => {
            document.getElementById('gitLatest').innerHTML = hash;
        })

    // get & set github commit url
    fetch(`/git/url`)
        .then(res => res.text())
        .then(url => {
            document.getElementById('gitLatest').setAttribute('href', url)
        })
}

onLoad()