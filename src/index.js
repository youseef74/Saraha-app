import "dotenv/config";
import express from "express";
import dbConnection from "./DB/db.connection.js";
import userController from "./Modules/Users/controllers/users.controller.js";
import authController from "./Modules/Users/controllers/auth.controller.js";
import messageController from "./Modules/Message/message.controller.js";
import cors from "cors";
import helmet from "helmet";
import { limiter } from "./Middleware/rate-limiter.middleware.js";

const app = express();

// connect to DB
dbConnection();

// whitelist
const whitelist = [
  "http://localhost:4200",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://52.86.241.32:3000",
];
const corsOptions = {
  origin: function (origin, callback) {
    console.log("origin =>", origin);
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
app.use("/uploads", express.static("uploads"));

// routes
app.get("/test", (req, res) => {
  res.send("test ok ✅");
});

app.use(
  "/messages",
  (req, res, next) => {
    next();
  },
  messageController
);

app.use("/users", userController, authController);

// error handler
app.use(async (err, req, res, next) => {
  console.log("Error caught:", err.message);
  res.status(err.cause || 500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
})

// server
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("server is running on port", process.env.PORT);
});
