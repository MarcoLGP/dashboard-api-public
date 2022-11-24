import { Router } from "express";
import { db } from "../mongo_db.js";
import * as dotenv from 'dotenv'
import { verifyRequest } from "../utils/verifyRequest.js";
dotenv.config()

const router = Router()

router.post('/verifyUser/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        db.collection("Users").findOne({ Email: token.data.email }).then(res_user_email => {
           
            if (res_user_email) {
                
                if (token.data.provider === res_user_email.Provider) {
                    res.status(200).json({ email: res_user_email.Email, code: 200 })
                } else {
                    res.status(200).json({ status: 'Registred from another provider', code: 204 })
                }
           
            } else {
                
                db.collection("Users").findOne({ Username: token.data.username }).then(res_user_username => {
                    if (res_user_username) {
                        res.status(200).json({ email: token.data.email, code: 202 })
                    } else {
                        res.status(200).json({ email: token.data.email, username: token.data.username, code: 203 })
                    }
                })

            }
        })

    })

})

export default router