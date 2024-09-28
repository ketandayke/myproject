import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name :process.env.CLOUDINARY_CLOUD_NAME,
    api_key :process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async function(localFilePath){
    try{
        if(!localFilePath)  return null;
        //upload file on cludinary
        const responce = await cloudinary.uploader.upload(localFilePath,{  //await only stops execution of async function not entire program
            resource_type:'auto'
        });
        console.log("file uploaded successfully on url",responce.url)
        return responce;

    }catch(error){
        fs.unlinkSync(localFilePath)// remove the file from local storage because failed to upload on cloudinary
        return null;
        
    }
}

export {uploadOnCloudinary}