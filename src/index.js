import 'dotenv/config';
import express from 'express';
import dbConnection from './DB/db.connection.js';
import userController from './Modules/Users/controllers/users.controller.js';
import messageController from './Modules/Message/message.controller.js';
import cors from 'cors';
import helmet from 'helmet';
import {limiter} from './Middleware/rate-limiter.middleware.js'
import authController from './Modules/Users/controllers/auth.controller.js';


const app = express();

// connect to DB
dbConnection();






const whitelist = ['http://localhost:4200','http://localhost:3000','http://localhost:3001'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log('origin =>', origin);

    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter); 
app.use(express.json());
app.use('/uploads',express.static('uploads'))

app.get('/test',(req,res)=>{
  console.log(req.rate_limit);
  
  res.send("test")
})
app.use('/users', userController,authController);
app.use('/messages', messageController);



app.use(async (err, req, res, next) => {
  console.log("Session is running", req.session);

  if (req.session && req.session.inTransaction()) {
    await req.session.abortTransaction();
    req.session.endSession();
    console.log("session is aborted");
  }

  console.log(err.stack);
  res.status(err.cause || 500).json({
    message: "Something went wrong",
    error: err.message,
    stack: err.stack
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(process.env.PORT, () => {
  console.log("server is running on port", process.env.PORT);
});
