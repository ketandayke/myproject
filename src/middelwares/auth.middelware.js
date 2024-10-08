import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
export const verifyJwT = asyncHandler(async (req,res,next)=>{

 try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ",""); //for retriving access token from req by removing bearer(space) prefix from headers authourization token
   
     if(!token){
       throw new ApiError(401,"Unauthorized access")
     }
     const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
     const user = await User.findById(decodedToken?._id)
     if(!user){
       throw new ApiError(401,"user Invalid access ")
     }
   
     req.user=user 
     next();
 } catch (error) {
    throw new ApiError(401,error?.message ||"Invalid access token")
 }

});