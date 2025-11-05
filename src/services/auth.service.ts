
import User from "../db/models/User"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

async function register(username: string, password: string, favoriteNumber: number, role: string = 'user') {
    console.debug("creating new user...")

    const checkExisting = await User.findOne({ username })
    if (checkExisting) throw new Error('username already taken')
    console.debug("username not taken, making user")

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hash, favoriteNumber, role })

    return user
}

async function login(username: string, password: string) {
    const user = await User.findOne({ username })
    if (!user) throw new Error('user not found')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('invalid password')
    console.debug('a user has logged in')

    return jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1d' })
}

export { register, login }