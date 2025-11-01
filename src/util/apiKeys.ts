
import crypto from 'crypto'

function generate() { return crypto.randomBytes(32).toString('hex') }

// Export
const apiKeys = { generate }
export default apiKeys