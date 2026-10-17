import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"])

const connectDB = async () => {
    try {
        const Mongo_URI = process.env.MONGO_URI;
        if (!Mongo_URI) {
            throw new Error("Mongo DB not found");
        }
        const connectionInstance = await mongoose.connect(Mongo_URI)
        console.log(`\n Database is connected: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Mongo not connected", error);
        process.exit(1);      
    }
};

export default connectDB; 

