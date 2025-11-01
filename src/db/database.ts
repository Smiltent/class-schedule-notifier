
import mongoose from "mongoose"

export default class Database {
    constructor(uri: string) {
        this.connect(uri)
    }

    private async connect(uri: string) {
        try {
            console.debug(`Connecting to database...`)
            await mongoose.connect(uri)

            console.info("Connected to database!")
        } catch (err) {
            console.error(`Error connecting to database: ${err}`)
            process.exit(1)
        }
    }
}