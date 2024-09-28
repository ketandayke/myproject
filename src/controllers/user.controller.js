import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {User} from "../models/user.model.js"
import { ApiResponce } from "../utils/ApiResponce.js";
const registerUser = asyncHandler(async(req,res)=>{
    //get data of user from frontend
    // check if all data is present or not
    //check is user already exist?
    //get file of avatar and coverimage upload it to cloudinary
    //create object of user in db
    // than remove password and refreshtoke field from responce
    //check for user creation
    //return response

    const {username,fullname,email,password} = req.body
    //check for empty field in users data
    if([username,fullname,email,password].some((field)=>{
        field.trim()===""
    })){
        throw new ApiError(401,"All fields are required")
    };
    
    //check for users existence
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"username or email already exist ")
    }
    
    // check for file uploaded by user
    const avatarLocalFilePath = req.files?.avatar[0]?.path ;
    const coverImageLocalFilePath = req.files?.avatar[0]?.path;

    if(!avatarLocalFilePath){
        throw new ApiError(407,"avatar  file is required")
    }
    //upload on cloudinary
    const avatar = uploadOnCloudinary(avatarLocalFilePath) ;
    const coverImage = uploadOnCloudinary(coverImageLocalFilePath);
   
    if(!avatar){
        throw new ApiError(407,"avatar file is required")
    }
    
    //creating user object
    const user = User.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage :coverImage.url ||"",
            email,
            password,
            username:username.toLowerCase()

        }
    );

    const createdUser = User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"User registration failed due to server issue")
    }
  
    res.status(200).json(
        new ApiResponce(200,"User registered Succesfully")
    )


});

export {registerUser,}