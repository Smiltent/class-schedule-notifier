
import axios from 'axios'

// tnx to https://moosyu.nekoweb.org/pages/guides/latest_commit/ (now, partially)

var HASH = ''
var URL = ''

async function obtain() {
    try {
        const response = await axios.get(`${process.env.GITHUB_API_URL}/commits?per_page=1`)
        const sha = response.data[0].sha

        console.debug(`Obtain latest GitHub commit hash: ${sha}`)

        URL = `${process.env.GITHUB_COMMIT_URL}/${sha}`
        HASH = sha.substring(0, 14)
    } catch (error) {
        console.error('Error fetching the latest commit:', error);
    }
}

function getUrl() {
    return URL
}

function getHash() {
    return HASH
}

const GitHub = { obtain, getUrl, getHash }
export default GitHub