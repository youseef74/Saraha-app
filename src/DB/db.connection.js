import mongoose from "mongoose";


const dbConnection = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL_LOCAL)
        console.log("Database connected");
        
    } catch (error) {
        console.log(error);
        
    }
}
export default dbConnection

