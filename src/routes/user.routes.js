import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(registerUser)   //call registerUser method on /users/register route with post method

export default router ;