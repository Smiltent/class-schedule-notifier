
import axios from 'axios'

/**
 * Send a Discord webhook with the given message.
 * @param url Discord URL.
 * @param message String.
 * @returns Sends the webook.
 */
export default async function sendWebhook(url: string, message: any) {
    await axios.post(url, {
        content: message
    })
}
