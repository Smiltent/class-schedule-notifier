
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






        */
        // ================= BASE =================
        this.app.get('/v1/getweeks', (req, res) => {

        })

        // ================= CLASS SPECIFIC =================
        this.app.get('/v1/getclasses', (req, res) => {
            

        })

        this.app.get('/v1/getclass/:class', (req, res) => {
            // Check if :class is a class ID or a valid class


        })
        // ================= TEACHER SPECIFIC =================
        // ================= API AUTH =================
        // ================= LOGIN / REGISTER =================
    }

    private base() {
        this.app.use('/public', express.static(path.join(__dirname, '..', 'static', 'pub')))

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'static', 'index.html'))
        })

        this.app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '..', 'static', '404.html'));
        })
    }
    
    private start() {
        this.app.listen(this.port, () => {
            console.info(`Starting express server on 0.0.0.0:${this.port}`)
        })
    }
} 