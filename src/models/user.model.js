import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema(
    {
        username:{
            type:String,
            unique:true,
            required:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            unique:true,
            required:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, //cloudinary url
            required:true

        },
        coverImage:{
            type:String, //cloudinary url

        },
        password:{
            type:String,
            required:[true,"password must required"]
        },
        refreshToken:{
            type:String,
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",
            }
        ]
        
        
    },
    {timestamps:true}
    )

//pre middelware for userschema password upgradation
userSchema.pre("save",function(next){  //arrow function does not have this keyword
    if(!this.isModified(password))  return next();
 
    this.password = bcrypt.hash(this.password,10) //salt rounds=10
    next()
});

userSchema.methods.isPasswordCorrect = async function
   (password){
     return await bcrypt.compare(password,this.password)
    
}

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:ACCESS_TOKEN_EXPIRY
        }
        );
    
}
userSchema.methods.generateRefreshToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
        );
    
}
 export const User = mongoose.model("User",userSchema);