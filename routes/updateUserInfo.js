import { Router } from "express";
import { db } from "../mongo_db.js";
import * as dotenv from 'dotenv'
import { decrypt, encrypt } from "../crypto.js";
import { verifyRequest } from "../utils/verifyRequest.js";
dotenv.config()

const router = Router()

router.post('/updateUserImage/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key).then(token => {

        db.collection("Users").updateOne({ Username: token.data.username }, { "$set": { Img: token.data.img } })
            .then(() => {
                res.status(200).json({ status: 'image updated', code: 200 })
            })
            .catch(() => {
                res.status(200).json({ status: 'internal error in db', code: 202 })
            })

    })

})

router.post('/updateUserEmail/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        db.collection("Users").findOne({ Email: token.data.email }).then(user => {
            if (user) {
                res.status(200).json({ status: 'E-mail in use', code: 203 })
            } else {
                db.collection("Users").updateOne({ Email: user.Email }, { "$set": { Email: token.data.email } })
                    .then(() => res.status(200).json({ status: 'E-mail updated', code: 200 }))
                    .catch(() => res.status(200).json({ status: 'internal error in db', code: 202 }))
            }
        })

    })

})

router.post('/updateUserPassword/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        db.collection("Users").findOne({ Username: token.data.username }).then(user => {
            const password_decrypted = decrypt(user.Password)
            if (password_decrypted == token.data.old_pass) {
                const new_pass_encrypted = encrypt(token.data.new_pass)
                db.collection("Users").updateOne({ Username: token.data.username }, { "$set": { Password: new_pass_encrypted } })
                    .then(() => res.status(200).json({ status: 'user password updated', code: 200 }))
                    .catch(() => res.status(200).json({ status: 'internal error in db', code: 202 }))
            } else {
                res.status(200).json({ status: 'password incorrect', code: 203 })
            }
        })

    })

})

router.post('/updateUserUsername/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        db.collection("User").findOne({ Username: token.data.username_field }).then(user => {
            if (user) {
                res.status(200).json({ status: 'username used', code: 202 })
            } else {
                db.collection("Users").updateOne({ Username: token.data.username_user }, { "$set": { Username: token.data.username_field } })
                    .then(() => res.status(200).json({ status: 'username updated', code: 200 }))
                    .catch(() => res.status(200).json({ status: 'internal error in db', code: 203 }))
            }
        })

    })

})

router.post('/updateUserNotifications/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        if (token.data.operation === 'add') {

            try {
                db.collection("Users").updateOne({ Username: token.data.username_user }, { "$push": { Notifications: `${token.data.notification}` } })
                    .then(() => res.status(200).json({ status: 'notification sended', code: 200 }))
            } catch (error) {
                res.status(200).json({ status: 'error when send notification', code: 202 })
            }

        } else if (token.data.operation === 'remove') {

            try {
                db.collection("Users").updateOne({ Username: token.data.username_user }, { '$pull': { Notifications: `${token.data.notification}` } })
                    .then(() => res.status(200).json({ status: 'notification removed', code: 200 }))
            } catch (error) {
                res.status(200).json({ status: 'error when remove notification', code: 202 })
            }
        }

    })

})

router.post('/updateUserSolicitations/:token', (req, res) => {

    verifyRequest(req.params.token, req.body.key, res).then(token => {

        if (token.data.operation === 'add') {
            
            try {
                db.collection("Users").updateOne({ Username: token.data.username_user }, { '$push': { SolicitationsBy: `${token.data.username}` } })
                    .then(() => {
                        db.collection("Users").updateOne({ Username: token.data.username }, { '$push': { SolicitationsFor: `${token.data.username_user}` } })
                    }).then(() => res.status(200).json({ status: 'solicitation sended', code: 200 }))
            } catch (error) {
                res.status(200).json({ status: 'error when send solicitation', code: 202 })
            }

        } else if (token.data.operation === 'remove') {
            
            try {
                db.collection("Users").updateOne({ Username: token.data.username_user }, { '$pull': { SolicitationsBy: `${token.data.username}` } })
                    .then(() => {
                        db.collection("Users").updateOne({ Username: token.data.username }, { '$pull': { SolicitationsFor: `${token.data.username_user}` } })
                    }).then(() => res.status(200).json({ status: 'solicitation removed', code: 200 }))
            } catch (error) {
                res.status(200).json({ status: 'error when remove solicitation', code: 202 })
            }

        } else if (token.data.operation === 'accept') {

            try {
                db.collection("Users").updateOne({ Username: token.data.username_user }, { "$pull": { SolicitationsFor: `${token.data.username}` } })
                db.collection("Users").updateOne({ Username: token.data.username }, { "$pull": { SolicitationsBy: `${token.data.username_user}` } })
                db.collection("Users").updateOne({ Username: token.data.username_user }, { "$push": { Connections: `${token.data.username}` } })
                db.collection("Users").updateOne({ Username: token.data.username }, { "$push": { Connections: `${token.data.username_user}` } })
                res.status(200).json({ status: 'solicitation accepted', code: 200 })
            } catch (error) {
                res.status(200).json({ status: 'error when accept solicitation', code: 202 })
            }

        } else {
            res.status(200).json({ status: 'invalid request', code: 203 })
        }

    })

})

export default router;