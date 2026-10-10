import mongoose from "mongoose";
import { serverConfig } from ".";
import dns from "node:dns";

// Fix for querySrv ECONNREFUSED when resolving MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not set custom DNS servers:", e);
}


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