
import fs from "fs"

async function createDir(path: string) {
    if (!fs.existsSync(path)) { 
        fs.mkdirSync(path, { recursive: true }) 
    }
}

async function removeDir(path: string) {
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true, force: true })
    }
}

async function createFile(path: string, data: any) {
    await createDir(path)
    fs.writeFileSync(path, data)
}

const dir = { createDir, createFile, removeDir }
export default dir