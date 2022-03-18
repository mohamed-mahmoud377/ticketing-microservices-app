import mongoose from "mongoose";
import {app} from './app'
const startUpDBConnection = async ()=>{
    console.log("Starting up ...V2 ")
    if (!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }
    if (!process.env.MONGO_URI){
        throw new Error("MONGO_URI must be defined ")
    }
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to database successfully ..")

    }catch (e) {
        console.log(e)
    }
    app.listen(3000, () => {
        console.log("server is up and running on port 3000.. ")
    })

}

startUpDBConnection()






