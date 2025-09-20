import mongoose from "mongoose";

const {
    MONGO_URL: mongoUrl
} = process.env;

export async function setupMongo() {
    try {
        if (mongoose.connection.readyState === 1) {
            return
        }

        console.log("🎲 connecting to database...")
        await mongoose.connect(String(mongoUrl), {
            serverSelectionTimeoutMS: 3000,
        })
        console.log("✅ Connected to database")
    }
    catch (err) {
        throw new Error("❌ Error connecting to database: " + err)
    }
}   
