
import { WebSocketServer } from 'ws'
import express from 'express'
import cors from 'cors'
import path from 'path'
import http from 'http'

import weeksRoutes from './routes/weeks.routes.ts'
import userRoutes from './routes/user.routes.ts'
import keysRoutes from './routes/keys.routes.ts'

export default class WebServer {
    private app: express.Express
    private wss: WebSocketServer
    private server: http.Server
    private port: string

    constructor(port: string) {
        console.debug("Running a new webserver.ts instance...")

        this.port = port
        
        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({ server: this.server })
        
        this.express() 
        this.api_v1()
        this.ws()

        this.start()
    }

    // ================= WEBSOCKETS =================
    private ws() {
        this.wss.on('connection', (ws, req) => {
            console.debug('New Client connected')

            ws.on('close', () => console.debug('Client disconnected'))
        })

        this.server.on('upgrade', (req, soc, head) => {
            const { url } = req

            if (url !== '/v1/ws') return soc.destroy()
        })
    }

    public sendWSMessage(msg: string) { this.wss.clients.forEach(c => c.send(msg)) }

    // ================= API =================
    private api_v1() {
        this.app.use('/v1/weeks', weeksRoutes)
        this.app.use('/v1/keys', keysRoutes)

        this.app.use('/v1/user', userRoutes)
    }

    private express() {
        this.app.use(express.json())
        this.app.use(cors())

        this.app.use('/public', express.static(path.join(__dirname, '..', 'public', 'src')))

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
        })

        this.app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
        })
    }
    
    private start() {
        this.server.listen(this.port, () => console.info(`Starting http server on 0.0.0.0:${this.port}`))
    }
} 