
import express from 'express'
import path from 'path'
import fs from 'fs'

export default class Express {
    private app: express.Express
    private port: string

    constructor(port: string) {
        this.app = express()
        this.port = port

        this.apiRoutes()
        this.start()
    }

    private apiRoutes() {
        this.app.use('/public', express.static(path.join(__dirname, '..', 'static', 'pub')))

        this.app.use('/class', (req, res) => {
            const filePath = path.join(__dirname, 'tmp', 'classes', `${req.path}.json`);
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).sendFile(path.join(__dirname, '..', 'static', '404.html'));
            }
        });

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'static', 'index.html'))
        })
        this.app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '..', 'static', '404.html'));
        });
    }
    
    private start() {
        this.app.listen(this.port, () => {
            console.info(`Starting express server on 0.0.0.0:${this.port}`)
        })
    }
} 