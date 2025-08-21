
import 'dotenv/config';
import express from 'express';
import dbConnection from './DB/db.connection.js';
import userController from './Modules/Users/users.controller.js';
import messageController from './Modules/Message/message.controller.js';

console.log(process);


const app = express();
dbConnection();

app.use(express.json());
app.use('/users', userController);
app.use('/messages',messageController)


app.use(async(err,req,res,next)=>{
    console.log("Session is running", req.session);
    
    if(req.session&& req.session.inTransaction()){
            await req.session.abortTransaction()
            req.session.endSession()
            console.log("session is aborted")
    }

    console.log(err.stack);
    res.status(err.cause || 500).json({message: "Something went wrong",error:err.message,stack:err.stack});
    
})

app.use((req,res) => {
    
    res.status(500).json({message: "Not Found"});
});

app.listen(process.env.PORT, () => {
    console.log("server is running on port",process.env.PORT);
});