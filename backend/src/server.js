import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

console.log("MongoDB URI loaded:", !!process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try{
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    }catch (error){
        console.error("Failed to start the server:", error.message);
        process.exit(1);
    }
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

startServer();