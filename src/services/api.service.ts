
import ApiKeys from "../db/models/ApiKeys"
import User from "../db/models/User"
import crypto from 'crypto'

// TODO: make sure these all are in a try {} block

async function create(name: string, username: string, domain: string) {
    const user = await User.findOne({ username })
    if (!user) throw new Error('user not found')

    const key = crypto.randomBytes(32).toString('hex')
    await ApiKeys.create({ name, key, domain, owner: user.username })

    return key
}

async function deletee(id: string) {

}