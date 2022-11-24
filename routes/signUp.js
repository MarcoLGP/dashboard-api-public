import upperCaseFirstLetter from '../utils/uppercaseFirstLetter.js'
import { Router } from 'express'
import fetch from "node-fetch"
import { db } from '../mongo_db.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { encrypt } from '../crypto.js'
import * as dotenv from 'dotenv'
import { verifyRequest } from '../utils/verifyRequest.js'
dotenv.config()

const router = Router()

router.post('/signUp/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {
        db.collection("Users").findOne({ Email: token.data.Email }).then(res_user_email => {
            db.collection("Users").findOne({ Username: token.data.Username }).then(async (res_user_username) => {
                if (res_user_email && res_user_username) {
                    res.status(200).json({ status: 'E-mail and username used', code: 202 })
                } else if (res_user_username) {
                    res.status(200).json({ status: 'Username used', code: 203 })
                } else if (res_user_email) {
                    res.status(200).json({ status: 'E-mail used', code: 204 })
                } else {
                    await fetch(`https://us1.locationiq.com/v1/reverse?key=${process.env.KEY_LOCATION_IQ}&lat=${token.data.userLocation.latitude}&lon=${token.data.userLocation.longitude}&format=json`)
                        .then(async (response) => {
                            const data = await response.json()
                            const { country_code, state } = data.address
                            const passHashed = encrypt(token.data.Password)
                            const taskUser = { Name: upperCaseFirstLetter(token.data.Name).trim(), Username: token.data.Username.toLowerCase().trim().replace(' ', ''), Email: token.data.Email.toLowerCase().trim(), Localization: { country_code, state }, Password: passHashed }

                            const token_register = encrypt(jwt.sign({ data: taskUser }, process.env.JWT_SECRET))

                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'marco.luca.brasil@gmail.com',
                                    pass: 'jyiukuljnntvnzvu'
                                }
                            });

                            const mailOptions = {
                                from: 'marco.luca.brasil@gmail.com',
                                to: token.data.Email,
                                subject: 'Confirme seu e-mail e complete o cadastro',
                                text: 'Complete o seu cadastro, clique aqui !',
                                html: `<span><b>Complete o seu cadastro,</b><a href=${process.env.BASE_URL}/confirm-email/${token_register}> clique aqui !</a></span>`
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    res.status(200).json({ status: 'Error in sending e-mail', code: 206 })
                                } else {
                                    res.status(200).json({ status: 'Verify e-mail sended', code: 200 })
                                }
                            });

                        }).catch(err => res.status(200).json({ status: 'error in api location: ' + err, code: 205 }))
                }
            })
        })
    })
})

export default router
