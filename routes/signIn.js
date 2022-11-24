import { Router } from "express";
import { db } from "../mongo_db.js";
import * as dotenv from 'dotenv'
import { compare, encrypt } from "../crypto.js";
import { verifyRequest } from "../utils/verifyRequest.js";
import jwt from 'jsonwebtoken'
dotenv.config()

const router = Router();

router.post("/signIn/:token", (req, res) => {

  verifyRequest(req.params.token, req.body.key, res)
    .then(token => {
      db.collection("Users").findOne({ Email: token.data.Email })
        .then(user => {
          if (!user) {
            res.status(200).json({ status: 'user not found', code: 202 })
          } else {
            compare(user.Password, req.body.key, token.data.Password)
              .then(result => {
                if (result) {
                  const signed_user_token = encrypt(jwt.sign({ data: { Email: token.data.Email } }, process.env.JWT_SECRET))
                  res.status(200).json({ token: signed_user_token, code: 200 })
                } else {
                  res.status(200).json({ status: 'Invalid credentials', code: 203 })
                }
              })
          }
        })
    })

});

export default router;
