import { db } from '../mongo_db.js'
import { Router } from 'express'
import * as dotenv from 'dotenv'
import { verifyRequest } from '../utils/verifyRequest.js'
dotenv.config()

const router = Router()

async function searchUser(property, value) {
    const user = await db.collection("Users").findOne({ [property]: value })
    return user
}

router.post('/getUser/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {
        searchUser('Email', token.data.Email).then(user => {
            if (user) {
                res.status(200).json({ user: user, code: 200 })
            } else {
                res.status(200).json({ status: 'user not found', code: 203 })
            }
        })
    })
})

router.post('/getUserImage/:user', (req, res) => {

    if (req.body.key !== process.env.CRYPTO_SECRET) {
        res.status(200).json({ status: 'invalid key', code: 201 })
    } else {
        searchUser('Username', req.params.user).then(user => {
            if (user) {
                res.status(200).json({ img: user.Img, code: 200 })
            } else {
                res.status(200).json({ status: 'user not found', code: 202 })
            }
        })
    }

})

router.post('/getUserProfile/:user', (req, res) => {

    if (req.body.key !== process.env.CRYPTO_SECRET) {
        res.status(200).json({ status: 'invalid key', code: 201 })
    } else {
        searchUser('Username', req.params.user).then(user => {
            res.status(200).json({ user: user, code: 200 })
        })
    }

})

router.post('/searchUsers/:search', (req, res) => {

    async function queryUsers(query) {
        const res_search_users = await db.collection("Users").find({ "Username": { "$regex": new RegExp(query, 'i') } }).toArray()
        return res_search_users
    }

    if (req.body.key !== process.env.CRYPTO_SECRET) {
        res.status(200).json({ status: 'invalid key', code: 201 })
    } else {
        queryUsers(req.params.search).then(users => {
            res.status(200).json({ users: users, code: 200 })
        })
    }

})

export default router
