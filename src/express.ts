
import express from 'express'
import path from 'path'
import fs from 'fs'

export default class Express {
    private app: express.Express
    private port: string

    constructor(port: string) {
        this.app = express()
        this.port = port

        this.v1()
        this.base()
        this.start()
    }

    private v1() {
        /*
            * [ ] Check if the API key is valid
            * [ ] Check if all variables are valid
        */
        // ================= BASE =================
        this.app.get('/v1/getweeks', (req, res) => {

        })

        // ================= CLASS SPECIFIC =================
        this.app.get('/v1/getallclasses', (req, res) => {
            // Provides a list of every class id, name, teacher and their teacher id
        })

        this.app.get('/v1/getcurrentclassweek/:class', (req, res) => {
            // Check if :class is a class ID or a valid class name
            // Provides the week schedule for the provided class
        })

        this.app.get('/v1/getupcomingclassweek/:class', (req, res) => {
            // Check if :class is a class ID or a valid class
            // Provides the week schedule for the provided class
        })

        this.app.get('/v1/getspecificweek/:week/:class', (req, res) => {
            // Check if :class is a class ID or a valid class name
            // Check if :week is a obtainable week
            // Provides the specific week schedule for the provided class
        })
        // ================= TEACHER SPECIFIC =================
        // ================= API AUTH =================
        // ================= LOGIN / REGISTER =================
    }

    private base() {
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public', 'src')))

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
        })

        this.app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
        })
    }
    
    private start() {
        this.app.listen(this.port, () => {
            console.info(`Starting express server on 0.0.0.0:${this.port}`)
        })
    }
} 