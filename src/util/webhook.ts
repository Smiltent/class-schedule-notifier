
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

    const hunks = message
        .split('%m')
        .map(m => m.trim())
        .filter(Boolean)

    const messages: string[] = []
    var current = ""

    for (const hunk of hunks) {
        const formated = `${hunk}\n\n`

        if ((current + formated).length > 1800) {
            messages.push(current.trimEnd())
            current = formated
        } else {
            current += formated
        }
    }

    if (current.trim()) {
        messages.push(current.trimEnd())
    }

    try {
        for (var i = 0; i < messages.length; i++) {
            await wait(5000)

            await axios.post(url, {
                content: '```diff\n' + messages[i] + '\n```'
            })
        }
    } catch (err) {
        console.error(`Failed to send webhook: ${err}`)
    }
}
