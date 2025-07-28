import dotenv from "dotenv"
dotenv.config({
    path:'./.env'
})
import ConnectDB from "./db/index.js";
import {app} from './app.js'

ConnectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=> console.log(`MongoDB connection failed`))