
const GITHUB_API_URL = 'https://api.github.com/repos/Smiltent/class-schedule-notifier'
const GITHUB_COMMIT_URL = 'https://github.com/Smiltent/class-schedule-notifier/commit'

function onLoad() {
    // thnx to https://moosyu.nekoweb.org/pages/guides/latest_commit/
    fetch(`${GITHUB_API_URL}/commits?per_page=1`)
        .then(res => res.json())
        .then(res => {
            let sha = res[0].sha;
            
            let url = `${GITHUB_COMMIT_URL}/${sha}`;
            document.getElementById('gitLatest').innerHTML = `HEAD@<a href="${url}">${sha.substring(0, 7)}`
        })
}

onLoad()