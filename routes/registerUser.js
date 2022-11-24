import { Router } from "express";
import jwt from "jsonwebtoken"
import { db } from "../mongo_db.js";
import * as dotenv from 'dotenv'
import { encrypt } from "../crypto.js";
import { verifyRequest } from "../utils/verifyRequest.js";
import node_fetch from "node-fetch"
dotenv.config()

const router = Router()

router.post('/registerUser/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        const { Username, Email } = token.data
        db.collection("Users").findOne({ Username: Username }).then(user_username => {
            db.collection("Users").findOne({ Email: Email }).then(async user_email => {
                if (user_email && user_username) {
                    res.status(200).json({ status: 'E-mail and username used', code: 204 })
                } else if (user_email) {
                    res.status(200).json({ status: 'E-mail used', code: 203 })
                } else if (user_username) {
                    res.status(200).json({ status: 'Username used', code: 202 })
                } else {
                    const { userLocation, Password } = token.data
                    const passHashed = encrypt(Password)
                    await node_fetch(`https://us1.locationiq.com/v1/reverse?key=${process.env.KEY_LOCATION_IQ}&lat=${userLocation.latitude}&lon=${userLocation.longitude}&format=json`).then(async res_location_api => {

                        const data_location_api = await res_location_api.json()
                        const token_email_registred_user = encrypt(jwt.sign({ data: { Email: Email } }, process.env.JWT_SECRET))
                        db.collection("Users").insertOne({ Username, Email, Localization: { country_code: data_location_api.address.country_code, state: data_location_api.address.state }, Password: passHashed, Img: '', Notifications: [], Connections: [], SolicitationsBy: [], SolicitationsFor: [] })

                            .then(() => {
                                res.status(200).json({ token: token_email_registred_user, code: 200 })
                            })
                            .catch(() => {
                                res.status(200).json({ status: 'internal error in db', code: 205 })
                            })
                    })
                }
            })
        })
    })
})

router.post('/registerUserSocial/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res)
        .then(token => {

            const { Username, Email } = token.data

            db.collection("Users").findOne({ Username: Username }).then(user_username => {
                db.collection("Users").findOne({ Email: Email }).then(user_email => {
                    if (user_email && user_username) {
                        res.status(200).json({ status: 'E-mail and username used', code: 204 })
                    } else if (user_email) {
                        res.status(200).json({ status: 'E-mail used', code: 203 })
                    } else if (user_username) {
                        res.status(200).json({ status: 'Username used', code: 202 })
                    } else {
                        const { userLocation, Password, Img, Provider } = token.data
                        const passHashed = encrypt(Password)
                        node_fetch(`https://us1.locationiq.com/v1/reverse?key=${process.env.KEY_LOCATION_IQ}&lat=${userLocation.latitude}&lon=${userLocation.longitude}&format=json`).then(async res_location_api => {
                            const data_location_api = await res_location_api.json()
                            const token_email_registred_user = encrypt(jwt.sign({ data: { Email: Email } }, process.env.JWT_SECRET))
                            db.collection("Users").insertOne({ Username, Email, Localization: { country_code: data_location_api.address.country_code, state: data_location_api.address.state }, Password: passHashed, Img: Img || '', Notifications: [], Connections: [], SolicitationsBy: [], SolicitationsFor: [], Provider: Provider })
                                .then(() => {
                                    res.status(200).json({ token: token_email_registred_user, code: 200 })
                                })
                                .catch(() => {
                                    res.status(200).json({ status: 'internal error in db', code: 205 })
                                })
                        })
                    }
                })
            })
        })
})

export default router;