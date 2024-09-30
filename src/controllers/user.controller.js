import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {User} from "../models/user.model.js"
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"


 const generateAccessAndRefreshTokens= async function(userId){
     const user = await User.findById(userId)
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()

     if(!refreshToken){
        return new ApiError(500,"server issue ! failed to generate tokens")
     }

     user.refreshToken =refreshToken;
     user.save({validateBeforeUpdate:false})  //update user as given
     return{accessToken,refreshToken}
}

// method for registering user on app

const registerUser = asyncHandler(async(req,res)=>{
    //get data of user from frontend
    // check if all data is present or not
    //check is user already exist?
    //get file of avatar and coverimage upload it to cloudinary
    //create object of user in db
    // than remove password and refreshtoke field from responce
    //check for user creation
    //return response
    // console.log("requst boyd data",req.body);
    const {username,fullName,email,password} = req.body
    //check for empty field in users data
    // if([username,fullname,email,password].some((field)=>
    //     field.trim()===""
    // )){
    //     throw new ApiError(401,"All fields are required")
    // };
    // Check for empty field in user's data
    if ([username, fullName, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(401, "All fields are required");
    }

    
    //check for users existence
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"username or email already exist ")
    }
    
    // check for file uploaded by user
    // console.log("request files data :",req.files);
    const avatarLocalFilePath = req.files?.avatar[0]?.path ;  // in req.files check for first property in avatar file and get its path
    // const coverImageLocalFilePath = req.files?.coverImage[0]?.path;   //gives undefined error to solve this
    let coverImageLocalFilePath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage >0 ){
        coverImageLocalFilePath =req.files.coverImage[0].path ;
    }

    if(!avatarLocalFilePath){
        throw new ApiError(407,"avatar  file is required")
    }
    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalFilePath) ;
    const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);
   
    if(!avatar){
        throw new ApiError(407,"avatar file is required")
    }
    
    //creating user object
    const user =await User.create(
        {
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase()

        }
    );

    const createdUser =await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"User registration failed due to server issue")
    }
  
    return res.status(201).json(
        new ApiResponce(200,createdUser,"User registered Succesfully")
    )


});


// method for login of user 

const loginUser = asyncHandler(async (req,res)=>{
    //req body ->data
    //find user based on username or email
    //check for password correctness
    //generate access and refresh tokens
    // send cookies

    const {username,email,password} =req.body ;

    if(!username && !email){
        return new ApiError(404,"username or email is required")
    }

    const user =await User.findOne({
        $or:[{username},{email}] 
    })
    if(!user){
        return new ApiError(401,"User not found ! Please register first")
    }

    const isPasswordValid =await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        return new ApiError(404,"username or password is incorrect")
    }
 
    const {refreshToken,accessToken} =await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refeshToken")
    const options = {
        httpOnly :true,
        secure :true

    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponce(
        200,
        {
            user :loggedInUser,accessToken,refreshToken
        },
        "User logged In successfully"
        
        ))

})

// method for logout user

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }

        },
        {
            new :false
        }
        )

    const options = {
        httpOnly :true,
        secure :true

    }
    return res.status(200)
    .clearCookie("accessToken",req.accessToken,options)
    .clearCookie("refreshToken",req.user.refreshToken,options)
    .json(new ApiResponce(
        200,
        {

        },
        "User logged Out successfully"
        
        ))
    });

// method for refreshAccessToken (updating access token of client side)

const refreshAccessToken = asyncHandler(async(req,res)=>{
      const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

      if(!incomingRefreshToken){
        throw new ApiError(401,"refresh token not received")
      }

      try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedRefreshToken._id)
  
        if(!user){
          throw new ApiError(401,"Invalid refresh token")
        }
  
        if(incomingRefreshToken !== user.refreshToken){
          throw new ApiError(401,"refresh token session expired !Invalid refresh token")
        }
  
  
        const options={
          httpOnly:true,
          secure :true
        }
  
        const {accessToken,newRefreshToken} = generateAccessAndRefreshTokens(user._id)
  
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
          new ApiResponce(200,
              {
                  accessToken:accessToken,
                  refreshToken:newRefreshToken
              }),
              "access token updated"
        )
  
      } catch (error) {
        throw new ApiError(500,error?.message ||"something went wrong refreshToken in invalid")
      }

});

// method for changing password
const changePassword = asyncHandler(async(req,res)=>{
    const {password ,newPassword} =req.body

   try {
     if([{password},{newPassword}].some((field)=>field.trim()==="")){
         throw new ApiError(401,"password and new password both fields required")
     }
 
     const user = await User.findById(req.user?._id)
     if(!user){
         throw new ApiError(404,"You have to login first")
     }
 
     const isPasswordValid = await user.isPasswordCorrect(password)
 
     if(!isPasswordValid){
         throw new ApiError(401,"Please enter correct password")
     }
 
     user.password = newPassword;
     await user.save({validateBeforeSave:false});
 
     return res.status(200).json(new ApiResponce(200,
         {},
         "password changed successfully"
         ))
 
   } catch (error) {
     throw new ApiError(401,error?.message || "something went wrong Invalid password")
   }
})

//method for getting current user
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
               .json(new ApiResponce(200,
                req.user,
                "User fetched successfully"))
    
})

// function for updating user details
const updateUserDetails = asyncHandler(async(req,res)=>{
    try {
        const {fullName,email} = req.body
        if(!fullName && !email){
            throw new ApiError(400,"please fill fields to update")
        }
        const user = await User.findById(req.user?._id).select("-password");
        console.log("user before update ,",user);
        if(fullName && email){
            user.fullName=fullName
            user.email =email
        }
        else if(fullName && !email){
            user.fullName =fullName
        }
        else{
            user.email =email
        }
    
        await user.save({validateBeforeSave:false})
        console.log("user after update {but with old accessed user} ",user);
        console.log("user after update getting from req.user ",req.user)
        return res.status(200).json(new ApiResponce(200,
            {user:req.user},
            "user details updated"
            ))
    } catch (error) {
        throw new ApiError(400,"User details not updated")
    }

})

// function for updating avatar image
const updateUserAvatar = asyncHandler(async(req,res)=>{
    console.log("request to update avatar file ",req.file)
    const avatarLocalFilePath = req.file?.path
try {
    
        if(!avatarLocalFilePath){
            throw new ApiError(400,"avatar file not received :please upload again")
        }
    
        const avatar = await uploadOnCloudinary(avatarLocalFilePath) ;
         
        if(!avatar){
            throw new ApiError(400,"uploading avatar failed on cloudinary :please upload again")
        }
    
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set:{
                    avatar:avatar.url
                }
            },
            {new :true}
            ).select("-password")
        
        return res.status(200).json(new ApiResponce(200,
            {
                user:req.user
    
            },
            "avatar updated successfully"
            ))
    
} catch (error) {
    throw new ApiError(400,"avatar not updated :please upload file again")
    
}

});

// function for update users coverImage
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    console.log("request to update avatar file ",req.file)
    const coverImageLocalFilePath = req.file?.path
try {
    
        if(!coverImageLocalFilePath){
            throw new ApiError(400,"coverImage file not received :please upload again")
        }
    
        const coverImage = await uploadOnCloudinary(coverImageLocalFilePath) ;
         
        if(!avatar){
            throw new ApiError(400,"uploading coverImage failed on cloudinary :please upload again")
        }
    
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set:{
                    coverImage:coverImage.url
                }
            },
            {new :true}
            ).select("-password")
        
        return res.status(200).json(new ApiResponce(200,
            {
                user:req.user
    
            },
            "coverImage updated successfully"
            ))
    
} catch (error) {
    throw new ApiError(400,"coverImage not updated :please upload file again")
    
}

})
export {registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser,updateUserDetails,updateUserAvatar,updateUserCoverImage}