
import connectDB from "./db/index.js"
import dotenv from 'dotenv'
dotenv.config({
    path:"./env"
});

connectDB();


// import mongoose from "mongoose"
// import { DB_NAME } from "./constants.js"
// import dotenv from "dotenv"
// import express from "express"
// const app = express()
// dotenv.config()

// ;( async ()=>{  // remember semicolon to add at start
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error",()=>{
//             console.log("ERRR:",error);
//             throw error;
//         });

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listing on PORT ${process.env.PORT}`);
//         });

//     } catch(error){
//         console.log("Error ",error);
//         throw error;
//     }
// })()