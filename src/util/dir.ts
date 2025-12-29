
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

// TODO: bug, it causes an error. makes a directory with the file name...
// this function doesn't get used anyways...
async function createFile(path: string, data: any) {
    await createDir(path)
    fs.writeFileSync(path, data)
}

// Export
const dir = { createDir, createFile, removeDir }
export default dir