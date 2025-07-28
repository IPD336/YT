import {asyncHandler} from "../utils/asyncHander.js"
import {ApiError} from "../utils/apiErrors.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    //1.get data from body
    //2.check if data is valid/available
    //3.check if user already exist
    //4.crete and store

    const {fullName ,username , email , password } = req.body
    if(!email || !fullName || !username || !password){
        throw new ApiError(400,"All field are required")
    }

    const existingUser = await User.findOne({
        $or : [ {email }, {username} ]
    })
    if(existingUser){
        throw new ApiError(409,"User already exist")
    }
    console.log("req.files!!!! : ",req.files);
    
    const avatarLocalPAth = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPAth){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPAth)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Registration failed")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registration Successfully")
    )


})

export {registerUser}