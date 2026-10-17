import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from './app.js';

dotenv.config({
    path: './.env'

});

const StartServer = async () => {
    try {
        console.log("MONGODB URI CONNFIGURED:", Boolean(process.env.MONGO_URI));
        
        await connectDB();
        
        app.on("Error", (error)=> {
            console.log("Error", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running on port: ${process.env.PORT}`);
        })

    } catch (error) {
        console.log("Database not found", error);
        
    }
}

StartServer();