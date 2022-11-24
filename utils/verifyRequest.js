import jwt from 'jsonwebtoken'
import { decrypt } from '../crypto.js'

async function verifyRequest(token, key, res) {

    let decrypted_token

    try {
        decrypted_token = decrypt(token, key)
    } catch (err) {
        res.status(200).json({ status: 'invalid key', code: 201 })
    }

    const decoded_token = jwt.decode(decrypted_token)

    return decoded_token

}

export {
    verifyRequest
} 