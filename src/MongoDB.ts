
import mongoose from "mongoose"
import migrations from "./util/migrations"

export default class Database {
    constructor(uri: string) {
        this.connect(uri)
    }

    private async connect(uri: string) {
        try {
            console.debug(`Connecting to Database...`)
            await mongoose.connect(uri)
            await migrations()

            console.info("Connected to Database!")
        } catch (err) {
            console.error(`Error connecting to Database: ${err}`)
            process.exit(1)
        }
    }
}