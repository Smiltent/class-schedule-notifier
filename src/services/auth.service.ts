
import User from "../db/models/User"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

async function register(username: string, password: string, role: string = 'user') {
    const checkExisting = await User.findOne({ username })
    if (checkExisting) throw new Error('User already exists. Pick a new username')

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hash, role })

    return user
}

async function login(username: string, password: string) {
    const user = await User.findOne({ username })
    if (!user) throw new Error('User not found')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Invalid password')

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
}

export { register, login }