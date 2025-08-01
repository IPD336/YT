import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true
    },
    avatar:{
        type:{
            public_id : String,
            url : String,
        },  // cloudinary url
        require:true,
    },
    coverImage:{
        type:{
            public_id : String,
            url : String,
        },    // cloudinary url
    },
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        require:[true, "password is require"]
    },
    refreshToken:{
        type:String
    }
    
},{timestamps:true})

userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
})

userSchema.methods.passwordCheck = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User", userSchema)