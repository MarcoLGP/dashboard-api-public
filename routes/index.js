import { Router, json, urlencoded } from "express";
import signInRoute from "./signIn.js";
import signUpRoute from './signUp.js'
import getUserRoute from "./getUser.js"
import updateUserInfoRoute from "./updateUserInfo.js"
import registerUserRoute from "./registerUser.js";
import verifyUserRoute from "./verifyUser.js"

const router = Router();

router.use(json())
router.use(urlencoded({ extended: false }))

router.use(signInRoute);
router.use(signUpRoute);
router.use(getUserRoute);
router.use(updateUserInfoRoute);
router.use(registerUserRoute);
router.use(verifyUserRoute);

export default router;