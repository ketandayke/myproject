import {app} from "./app.js"
import connectDB from "./db/index.js"
import dotenv from 'dotenv'
dotenv.config({
    path:"./env"
});

connectDB()
.then(()=>{
    app.on("error ",(error)=>{
        console.log("Error :",error)
        throw error;

    });
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is live on ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log("MONGODB connection failed",error)
});


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