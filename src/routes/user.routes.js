import {Router} from "express"
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controller.js"
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

// route for updating users side access token and refreshtoken

router.route("/refersh-token").post(refreshAccessToken);

// route for change users password
router.route("/change-password").post(verifyJwT,changePassword);

// route for getting current users data
router.route("/get-user").get(verifyJwT,getCurrentUser);

//route for update user details
router.route("/update-user-details").post(verifyJwT,updateUserDetails)

//route for update user details
router.route("/update-user-avatar").post(upload.single,verifyJwT,updateUserDetails)

//route for update user details
router.route("/update-user-details").post(upload.single,verifyJwT,updateUserDetails)
export default router ;