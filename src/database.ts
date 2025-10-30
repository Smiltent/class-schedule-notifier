
import { MongoClient } from 'mongodb'

export default class Database {
    private client!: MongoClient

    constructor(uri: string) {
        this.start(uri)
    }

    public async storeWeekData(week: number, name: string, data: any) {

    }

    public async obtainWeekData(week: number) {

    }

    public async obtainDataByClassId(className: string) {

    }

    public async obtainDataByTeacherId(teacherName: string) {

    }

    // ================= INTERNAL =================
    private async start(uri: string) {
        try {
            console.info("Connecting to database...")
            this.client = new MongoClient(uri)
            console.info("Connected to database!")
        } catch (err) {
            console.error(`Error connecting to database: ${err}`)
        }
    }

    private async disconnect() {
        try {
            await this.client.close()
            console.info("Disconnected from database!")
        } catch (err) {
            console.error(`Error disconnecting from database: ${err}`)
        }
    }
    
}