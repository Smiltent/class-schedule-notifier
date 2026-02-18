
import axios from 'axios'

// tnx to https://moosyu.nekoweb.org/pages/guides/latest_commit/
// TODO: Get the recent commit using the .git folder instead of making an API request (avoiding rate-limiting...)
export default async function gitHash() {
    try {
        const response = await axios.get(`${process.env.GITHUB_API_URL}/commits?per_page=1`)
        const sha = response.data[0].sha

        return {
            hash: sha.substring(0, 14),
            url: `${process.env.GITHUB_COMMIT_URL}/${sha}`
        }
    } catch (error) {
        console.error('Error fetching the latest commit:', error)
        return {
            hash: "unknown",
            url: "#"
        }
    }
}