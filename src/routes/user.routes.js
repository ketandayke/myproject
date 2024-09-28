import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from "../middelwares/multer.middelwares.js"

const router = Router()

router.route("/register").post(  //setting middelware for files uploading
    upload.fields([
        {
            name :"avatar",
            maxCount:1
        },
        {
            name :"coverImage",
            maxCount:1
        }
    ]),
    registerUser)   //call registerUser method on /users/register route with post method

export default router ;