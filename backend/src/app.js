const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// 1. Import Routers
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// 2. Debug Log (Check your terminal for these lines!)
console.log("Auth Router:", typeof authRouter); 
console.log("Interview Router:", typeof interviewRouter); 

// 3. Use Routers
app.use("/api/auth", authRouter);

// If "Interview Router" logged as 'undefined', the app will crash here:
app.use("/api/interview", interviewRouter); 

module.exports = app;