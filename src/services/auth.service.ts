
import User from "../db/models/User"
import jwt from "jsonwebtoken"
import { pick } from "lodash"
import bcrypt from "bcrypt"

interface UserData {
    username?: string,
    password?: string,
    favoriteNumber?: string,
    role?: string
}

async function register(username: string, password: string, favoriteNumber: number, role: string = 'user') {
    const checkExisting = await User.findOne({ username })
    if (checkExisting) throw new Error("username already taken")

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hash, favoriteNumber, role })

    console.debug("a user has registered")

    return user
}

async function login(username: string, password: string) {
    const user = await User.findOne({ username })
    if (!user) throw new Error("user not found")

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error("user with that password not found")

    console.debug('a user has logged in')

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
}

async function del(username: string) {
    const user = await User.findOne({ username })
    if (!user) throw new Error("user not found")

    // delete from db
    await User.deleteOne({ _id: user._id })

    console.debug(`user ${username} deleted`)

    return true
}

const allowedFields = ['username', 'password', 'role', 'favoriteNumber']
async function modify(ogUsername: string, newData: UserData) {
    const user = await User.findOne({ username: ogUsername })
    if (!user) throw new Error("user not found")

    // hash the password, if changed
    newData.password = newData.password ? await bcrypt.hash(newData.password, 10) : undefined

    // security check / save data
    Object.assign(user, pick(newData, allowedFields))
    await user.save()

    console.debug(`user ${ogUsername} modified`)

    return user
}

async function list() {
    return await User.find()
}

export { register, login, del, modify, list }