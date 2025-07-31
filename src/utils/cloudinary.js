import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

// steps 
// first we upload file on our server then we upload it on cloudinary
// here we assume that file has been uploaded on our server and its path is localFilePath 

const uploadOnCloudinary = async function (localFilePath) {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        // file uploaded successfully
        // console.log("file uploded ",response, "Url: ", response.url); // this gives response which has property : url,id,version,signature, width,height,format,btyes..
        
        // now deleting the file that we stored in public/temp
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //this functions remove the file that we have stores locally 
        return null
    }
}

const deleteOnCloudinary = async function (public_id) {
    try {
        if(!public_id) return null
        const response = await cloudinary.uploader.destroy(public_id,{
            resource_type : "auto"
        })
    } catch (error) {
        return error
    }
}

export {uploadOnCloudinary , deleteOnCloudinary}