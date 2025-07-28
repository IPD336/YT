import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"

import dotenv from 'dotenv'
dotenv.config()


const ConnectDB = async () => {
    try {
        const instance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDB connected !! DB HOST : ${instance.connection.host}`);
    } catch (err) {
        console.log("error connecting to db" , err);
        process.exit(1);
    }

    // mongoose.connect(process.env.MONGODB_URI)
    // .then((instance)=>{
    //     console.log(`\n MongoDB connected !! DB HOST : ${instance.Connection.host}`);
    // })
    // .catch((err)=>{
    //     console.log("error connecting to db" , err);
    //     process.exit(1);
    // })
}
export default ConnectDB;