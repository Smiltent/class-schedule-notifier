
import axios from 'axios'
import wait from './wait'

/**
 * Send a Discord webhook with the given message.
 * @param url Discord URL.
 * @param message String.
 * @returns Sends the webook.
 */
export default async function sendWebhook(url: string, message: string) {
    console.debug(`Sending a webhook`)

    const messages: string[] = []

    if (message.length > 1800) {
        for (let i = 0; i < message.length; i += 1800) {
            messages.push(message.slice(i, i + 1800))
        }
    } else {
        messages.push(message)
    }

    try {
        messages.forEach(async (message) => {
            await wait(5000)
            await axios.post(url, {
                content: message
            })
        })
    } catch (err) {
        console.error(`Failed to send webhook: ${err}`)
    }
}
