import {asyncHandler} from "../utils/asyncHander.js"
import {ApiError} from "../utils/apiErrors.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500,'something went wrong while generating access & refresh token')
    }
}


const registerUser = asyncHandler(async (req,res)=>{
    //1.get data from body
    //2.check if data is valid/available
    //3.check if user already exist
    //4.check for coverImages and avatar
    //5.upload them to cloudinary
    //6.create user
    //7.return res

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
    //console.log("req.files!!!! : ",req.files); // this gives the files that we upload through multer
    
    const avatarLocalPAth = req?.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req?.files?.coverImage?.[0].path

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

const loginUser = asyncHandler(async(req,res)=>{
    //1.get email,username,password
    //2.check if email / username is valid
    //3.check in db for that email/username 
    //4.after that check the password
    //5.give access token & refresh token
    //6.send cookie and login
    const { email , username , password } = req.body
    if(  !email && !username ){
        throw new ApiError(400,"username or email required")
    }
    const user = await User.findOne({
        $or: [{email},{username}]
    })
    if(!user){
        throw new ApiError(400,"User does not exist")
    }
    const match = await user.passwordCheck(password)
    if(!match){
        throw new ApiError(401,"password is incorrect")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly : true,
        secure:true
    }

    return res.status(200)
    .cookie('accessToken',accessToken , option)
    .cookie('refreshToken',refreshToken , option)
    .json(
        new ApiResponse(200, 
            {
            user : loggedInUser , accessToken , refreshToken
            },
            "User Login Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id, {
        $set:{
            refreshToken:undefined
            }
        },
        {
            new:true
        }
)
    const option = {
        httpOnly : true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{}, "User Logout Successfully"))
})

export {registerUser, loginUser , logoutUser}