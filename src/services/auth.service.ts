
import User from "../db/models/User"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

async function register(username: string, password: string, favoriteNumber: number, role: string = 'user') {
    console.debug("creating new user...")

    const checkExisting = await User.findOne({ username })
    if (checkExisting) throw console.debug("username taken")
    console.debug("username not taken, making user")

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hash, favoriteNumber, role })

    return user
}

async function login(username: string, password: string) {
    const user = await User.findOne({ username })
    if (!user) throw console.debug("user not found")

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw console.debug("invalid password")
    console.debug('a user has logged in')

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
}

async function deletee(username: string) {
    const user = await User.findOne({ username })
    if (!user) throw console.debug("user not found")

    await User.deleteOne({ _id: user._id })
    console.debug(`user ${username} deleted`)

    return true
}


export { register, login, deletee }