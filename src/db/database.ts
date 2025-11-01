
import mongoose from "mongoose"

export default class Database {

    constructor(uri: string) {
        this.start(uri)
    }

    // ================= SCHEDULE DATA =================
    // === STORE ===
    public async storeRawWeekData(week: string, data: any) {
        this.store(
            this.Collection("RawData"),
            { [week]: data }
        )
        console.debug(`Stored Raw Week Data (week ${week})`)
    }
    public async storeClassWeekData(classId: string, week: string, data: any) {
        this.store(
            this.Collection("ClassWeekData"),
            { [week]: { [classId]: data } }
        )
        console.debug(`Stored Class Week Data (week ${week}; class ${classId})`)
    }
    public async storeTeacherWeekData(teacherId: string, week: string, data: any) {
        this.store(
            this.Collection("TeacherWeekData"),
            { [week]: { [week]: { [teacherId]: data } }  }
        )
        console.debug(`Stored Teacher Week Data (week ${week}; teacher ${teacherId})`)
    }

    // === GET === // TODO: implement
    public async getRawWeekData(week: string) {}
    public async getClassWeekData(classId: string, week: string) {}
    public async getTeacherWeekData(teacherId: string, week: string) {}

    // ================= API KEYS =================
    public async storeAPIKey(key: string, owner: string) {}
    public async checkAPIKey(key: string): Promise<boolean> { return true }
    public async deleteAPIKey(key: string) {}
    public async modifyAPIKey(key: string, settings: any) {}

    // ================= LOGIN / REGISTER =================
    public async createUser(username: string, password: string) {}
    ...

    // ================= INTERNAL =================
    // start the code
    private async start(uri: string) {
        try {
            console.debug(`Connecting to database...`)
            await mongoose.connect(uri)

            console.info("Connected to database!")
        } catch (err) {
            console.error(`Error connecting to database: ${err}`)
        }
    }

    // generates an model with a name (collection)
    private Collection = (name: string) => mongoose.model(name, new mongoose.Schema({}, { strict: false }))

    // stores the data
    private async store(model: mongoose.Model<any>, rawSetData: any) {
        try {
            await model.updateOne(
                {},
                { $set: rawSetData },
                { upsert: true }
            )            
        } catch (err) {
            console.error(`Error storing data to Database: ${err}`)
        }
    }

    // obtains the data
    private async get() {
    //     try {
    //         const data = await this.RawDataModel.findOne({}, { [week]: 1 })
    //         console.debug(`Obtained raw week data (week ${week})`)
    //         return data
    //     } catch (err) {
    //         console.error(`Error obtaining data from Database: ${err}`)
    //     }
    // }
    }
}