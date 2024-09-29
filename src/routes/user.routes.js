import {Router} from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js"
import {upload} from "../middelwares/multer.middelware.js"
import { verifyJwT } from "../middelwares/auth.middelware.js"

const router = Router()

//route for registe user

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
    registerUser) ;  //call registerUser method on /users/register route with post method

// route for login user

router.route("/login").post(loginUser);

// route for logout user

router.route("/logout").post(verifyJwT,logoutUser);
export default router ;