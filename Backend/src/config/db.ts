import mongoose from "mongoose";
import { serverConfig } from ".";



export async function dbConnect() {
    try{
        console.log(serverConfig.MONGO_URL);
        
     await mongoose.connect(serverConfig.MONGO_URL);
     console.log("DATABASE CONNECTED");
    }catch(err){
        console.log(err);
        
    console.log("DATABASE NOT CONNECTED");
    process.exit(1);
    
    }
}